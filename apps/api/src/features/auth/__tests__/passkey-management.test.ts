import { AUDIT_ACTION } from "@workspace/contracts"
import { describe, expect, it } from "vitest"
import { LAST_PASSKEY_CONFIRMATION_REQUIRED } from "../constants/auth-errors"
import { auditRows } from "./support/audit-rows"
import { AUTH_URL, createOwnerClient, type OwnerClient } from "./support/owner-client"
import { newAuthenticator } from "./support/owner-with-passkey"
import { listPasskeys, registerPasskey } from "./support/passkey-flows"

const DELETE_URL = `${AUTH_URL}/passkey/delete-passkey`
const RENAME_URL = `${AUTH_URL}/passkey/update-passkey`

async function signedInOwner(): Promise<OwnerClient> {
  const client = createOwnerClient()
  await client.bootstrap()
  return client
}

describe("passkey management", () => {
  it("registers two passkeys, lists, renames and deletes one", async () => {
    const client = await signedInOwner()

    expect((await registerPasskey(client, await newAuthenticator(), "PC")).status).toBe(200)
    expect((await registerPasskey(client, await newAuthenticator(), "Tableta")).status).toBe(200)
    const [first, second] = await listPasskeys(client)
    expect([first?.name, second?.name].sort()).toEqual(["PC", "Tableta"])

    const rename = await client.request(RENAME_URL, { body: { id: first?.id, name: "PC caja" } })
    expect(rename.status).toBe(200)
    const remove = await client.request(DELETE_URL, { body: { id: second?.id } })
    expect(remove.status).toBe(200)

    expect(await listPasskeys(client)).toEqual([
      expect.objectContaining({ id: first?.id, name: "PC caja" }),
    ])
  })

  it("audits additions, renames and deletions by passkey id", async () => {
    const client = await signedInOwner()
    await registerPasskey(client, await newAuthenticator(), "PC")
    await registerPasskey(client, await newAuthenticator(), "Tableta")
    const [first, second] = await listPasskeys(client)

    await client.request(RENAME_URL, { body: { id: first?.id, name: "PC caja" } })
    await client.request(DELETE_URL, { body: { id: second?.id } })

    const added = await auditRows(AUDIT_ACTION.authPasskeyAdded)
    expect(added.map((row) => row.entityId).sort()).toEqual([first?.id, second?.id].sort())
    expect(await auditRows(AUDIT_ACTION.authPasskeyRenamed)).toEqual([
      { entityId: first?.id, details: null },
    ])
    expect(await auditRows(AUDIT_ACTION.authPasskeyDeleted)).toEqual([
      { entityId: second?.id, details: { lastPasskeyConfirmed: false } },
    ])
  })

  it("refuses to delete the last passkey without confirmation", async () => {
    const client = await signedInOwner()
    await registerPasskey(client, await newAuthenticator(), "PC")
    const [only] = await listPasskeys(client)

    const response = await client.request(DELETE_URL, { body: { id: only?.id } })

    expect(response.status).toBe(409)
    expect(await response.json()).toMatchObject({ code: LAST_PASSKEY_CONFIRMATION_REQUIRED.code })
    expect(await listPasskeys(client)).toHaveLength(1)
    expect(await auditRows(AUDIT_ACTION.authPasskeyDeleted)).toEqual([])
  })

  it("deletes the last passkey with confirmation, audits it, and keeps the password", async () => {
    const client = await signedInOwner()
    await registerPasskey(client, await newAuthenticator(), "PC")
    const [only] = await listPasskeys(client)

    const response = await client.request(DELETE_URL, {
      body: { id: only?.id, confirmLastPasskey: true },
    })

    expect(response.status).toBe(200)
    expect(await listPasskeys(client)).toEqual([])
    expect(await auditRows(AUDIT_ACTION.authPasskeyDeleted)).toEqual([
      { entityId: only?.id, details: { lastPasskeyConfirmed: true } },
    ])
    expect((await createOwnerClient().signInWithPassword()).status).toBe(200)
  })

  it("requires a session to register a passkey", async () => {
    const response = await registerPasskey(createOwnerClient(), await newAuthenticator(), "PC")

    expect(response.status).toBe(401)
  })
})
