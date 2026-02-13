import QRCode from 'react-qr-code';

function StickerCard({ code }) {
  return (
    <article className="sticker-card">
      <div className="qr-wrapper">
        <QRCode value={code} size={90} />
      </div>
      <p className="sticker-code">{code}</p>
      <p className="sticker-caption">Scan to Contact Vehicle Owner</p>
    </article>
  );
}

export default StickerCard;
