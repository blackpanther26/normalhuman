import { useAtom } from "jotai";
import React from "react";
import { searchValueAtom } from "./search-bar";
import { api } from "@/trpc/react";
import { useDebounceValue } from "usehooks-ts";
import useThreads from "@/hooks/use-threads";
import DOMPurify from "dompurify";

const SearchDisplay = () => {
  const [searchValue] = useAtom(searchValueAtom);
  const search = api.account.searchEmails.useMutation();
  const [debouncedSearch] = useDebounceValue(searchValue, 500);
  const { accountId } = useThreads();

  React.useEffect(() => {
    if (!debouncedSearch || !accountId) return;
    search.mutateAsync({ accountId, query: debouncedSearch });
  }, [debouncedSearch, accountId]);

  return (
    <div className="max-h-[calc(100vh-50px)] overflow-y-scroll p-4">
      <div className="mb-4 flex items-center gap-2">
        <h2 className="text-sm text-gray-600 dark:text-gray-400">
          Search results for "{searchValue}"
        </h2>
      </div>
      {search.data?.hits.length === 0 ? (
        <>
          <p>No results found...</p>
        </>
      ) : (
        <>
          {search.data?.hits.map((hit) => (
            <li
              key={hit.id}
              className="cursor-pointer list-none rounded-md border p-4 transition-all hover:bg-gray-100 dark:hover:bg-gray-900"
            >
              <h3 className="text-base font-medium">{hit.document.subject}</h3>
              <p className="text-sm text-gray-500">
                From : {hit.document.from}
              </p>
              <p className="text-sm text-gray-500">
                To : {hit.document.to.join(", ")}
              </p>
              <p
                className="mt-2 text-sm"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(hit.document.rawBody, {
                    USE_PROFILES: { html: true },
                  }),
                }}
              ></p>
            </li>
          ))}
        </>
      )}
    </div>
  );
};

export default SearchDisplay;
