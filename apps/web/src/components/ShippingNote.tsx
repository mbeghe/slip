type Props = {
  className?: string;
};

/** Aviso de envío — mejor en ficha, junto al pedido por WhatsApp */
export function ShippingNote({ className = "" }: Props) {
  return (
    <p
      className={`text-sm text-slip-accent-blue leading-relaxed ${className}`.trim()}
    >
      Enviamos a{" "}
      <span className="font-medium text-slip-ink">todo el país</span>. Al
      escribirnos por WhatsApp coordinamos el envío con vos.
    </p>
  );
}
