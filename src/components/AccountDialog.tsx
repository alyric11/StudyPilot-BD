import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import useDialogFocus from '../hooks/useDialogFocus';

export default function AccountDialog({ title, busy, onClose, children }: {
  title: string;
  busy: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useDialogFocus(true, ref, () => { if (!busy) onClose(); });
  useEffect(() => {
    const dialog = ref.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);
  return <dialog
    ref={ref} className="account-dialog" aria-labelledby="account-dialog-heading"
    onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}
    onClick={event => {
      if (busy || event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}
  >
    <header className="account-dialog-header">
      <h2 id="account-dialog-heading">{title}</h2>
      <button type="button" className="account-dialog-close" aria-label="Close account dialog" onClick={onClose} disabled={busy}><X size={21} aria-hidden="true" /></button>
    </header>
    {children}
  </dialog>;
}
