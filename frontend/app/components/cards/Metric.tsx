import React from "react";
import Link from "next/link";
import Image from "next/image";

interface Props {
  imgUrl?: string;
  href?: string;
  alt: string;
  value: string | number;
  title: string;
  textStyles: string;
  isAuthor?: boolean;
  imgStyles?: string;
}

const Metric = ({ imgUrl, href, alt, value, title, textStyles, isAuthor, imgStyles }: Props) => {
  const metricContent = (
    <>
      {imgUrl && (
        <Image src={imgUrl} alt={alt} width={16} height={16} className={`rounded-full object-contain ${imgStyles}`} />
      )}

      <p className={`${textStyles} flex items-center gap-1`}>
        {value}
        <span className={`small-regular line-clamp-1 ${isAuthor ? "max-sm:hidden" : ""}`}>{title}</span>
      </p>
    </>
  );

  return href ? (
    <Link href={href} className="flex-center gap-1">
      {metricContent}
    </Link>
  ) : (
    <div className="flex-center gap-1">{metricContent}</div>
  );
};
export default Metric;
