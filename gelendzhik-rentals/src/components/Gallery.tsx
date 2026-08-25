import { useState } from 'react';

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <div className="overflow-hidden rounded-2xl bg-sea-100 sm:col-span-4">
        <img
          src={images[active]}
          alt={`${title} — фото ${active + 1}`}
          className="aspect-[16/10] w-full object-cover"
        />
      </div>

      {images.map((image, index) => (
        <button
          key={image}
          type="button"
          onClick={() => setActive(index)}
          aria-label={`Показать фото ${index + 1}`}
          aria-current={index === active}
          className={[
            'overflow-hidden rounded-xl bg-sea-100 transition',
            index === active ? 'ring-2 ring-sea-900' : 'opacity-80 hover:opacity-100',
          ].join(' ')}
        >
          <img src={image} alt="" className="aspect-[4/3] w-full object-cover" />
        </button>
      ))}
    </div>
  );
}
