import { PRINTING_SPIKE_COPY } from "../constants/copy"
import "./html-test-ticket.css"

const TICKET_COPY = PRINTING_SPIKE_COPY.ticket

interface HtmlTestTicketProps {
  copyNumber: number
}

// Hidden on screen; the print stylesheet shows only this block on a 58 mm page.
export function HtmlTestTicket({ copyNumber }: HtmlTestTicketProps) {
  return (
    <div className="html-test-ticket hidden font-sans text-[10pt] leading-tight text-black print:block">
      <p className="text-center text-[14pt] font-bold">{TICKET_COPY.brand}</p>
      <p className="text-center">{TICKET_COPY.tagline}</p>
      <p className="text-center">{`${TICKET_COPY.copy} ${copyNumber}`}</p>
      <hr className="my-1 border-black border-dashed" />
      {TICKET_COPY.htmlLines.map((line) => (
        <p key={line}>{line}</p>
      ))}
      <p className="text-right font-bold">{TICKET_COPY.htmlTotal}</p>
      <p>{TICKET_COPY.htmlAccents}</p>
      <hr className="my-1 border-black border-dashed" />
    </div>
  )
}
