import { Link } from "@tanstack/react-router";
export function SiteFooter() {
  return (
    <footer className="border-t-2 border-ink py-8 text-center text-sm text-muted-foreground">
      <div className="flex flex-wrap justify-center gap-5">
        <Link to="/terms">Terms of Service</Link>
        <Link to="/privacy">Privacy Policy</Link>
        <a href="mailto:hello@shopsite.ai">Contact</a>
      </div>
      <p className="mt-3">© 2026 Shopsite AI</p>
    </footer>
  );
}
