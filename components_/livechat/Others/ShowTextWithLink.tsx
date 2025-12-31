import { Fragment } from 'react/jsx-runtime';

export default function ShowTextWithLink({
  text,
  className
}: {
  text: string;
  className?: string;
}) {
  if (!text) return <></>;
  const parts = text.split(/(https?:\/\/[^\s]+)/g);

  return (
    <>
      {parts.map((part, index) =>
        part.match(/https?:\/\/[^\s]+/) ? (
          <a
            key={index}
            href={part}
            target='_blank'
            rel='noopener noreferrer'
            className={`hover:no-underline underline ${className}`}
            title={part}
          >
            {part}
          </a>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        )
      )}
    </>
  );
}
