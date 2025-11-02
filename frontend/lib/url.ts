import queryString from "query-string";

interface UrlQueryParams {
  params: string;
  key: string;
  value: string;
}

export const formUrlQuery = ({ params, key, value }: UrlQueryParams) => {
  const newQueryString = queryString.parse(params);
  newQueryString[key] = value;

  return queryString.stringifyUrl({
    url: window.location.pathname,
    query: newQueryString,
  });
};

interface RemoveUrlQueryParams {
  params: string;
  keysToRemove: string[];
}

export const removeKeysFromUrlQuery = ({ params, keysToRemove }: RemoveUrlQueryParams) => {
  const newQueryString = queryString.parse(params);
  keysToRemove.forEach((key) => {
    delete newQueryString[key];
  });

  return queryString.stringifyUrl(
    {
      url: window.location.pathname,
      query: newQueryString,
    },
    { skipNull: true }
  );
};
