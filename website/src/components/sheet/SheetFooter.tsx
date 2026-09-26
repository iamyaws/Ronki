export const SHEET_FOOTER_LINE = 'Ronki hilft beim Dranbleiben. Streaks gibt es hier nicht.';

export function SheetFooter({ url = 'ronki.de/vorlagen' }: { url?: string }) {
  return (
    <footer className="rs-foot">
      <span>{SHEET_FOOTER_LINE}</span>
      <span className="rs-foot-url">{url}</span>
    </footer>
  );
}
