import StickerCard from './StickerCard';

function paginate(items, pageSize) {
  const pages = [];
  for (let i = 0; i < items.length; i += pageSize) {
    pages.push(items.slice(i, i + pageSize));
  }
  return pages;
}

function PrintLayout({ stickers }) {
  const duplicated = stickers.flatMap((sticker) => [sticker, sticker]);
  const pages = paginate(duplicated, 8);

  return (
    <div className="print-layout" id="print-layout">
      {pages.map((page, pageIndex) => (
        <section className="print-page" key={`page-${pageIndex}`}>
          <div className="sticker-grid">
            {page.map((sticker, index) => (
              <StickerCard key={`${sticker.id}-${pageIndex}-${index}`} code={sticker.code} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default PrintLayout;
