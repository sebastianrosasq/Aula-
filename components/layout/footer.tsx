import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand brand-footer">
            <span className="brand-mark" aria-hidden="true">
              A
            </span>
            <span>AulaEnlace</span>
          </div>
          <p>Propuesta académica de innovación educativa en etapa de validación.</p>
        </div>
        <div className="footer-note">
          <BookOpen aria-hidden="true" />
          <p>
            La simulación utiliza exclusivamente datos ficticios y no almacena información académica
            real.
          </p>
        </div>
        <p className="footer-meta">Design Thinking · Prototipo inicial · 2026</p>
      </div>
    </footer>
  );
}
