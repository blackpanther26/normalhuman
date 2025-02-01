import { useAtom } from "jotai";
import React from "react";
import { searchValueAtom } from "./search-bar";
import { api } from "@/trpc/react";
import { useDebounceValue } from "usehooks-ts";
import useThreads from "@/hooks/use-threads";
import DOMPurify from "dompurify";
import { Loader2, Mail, User, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const SearchDisplay = () => {
  const [searchValue] = useAtom(searchValueAtom);
  const search = api.account.searchEmails.useMutation();
  const [debouncedSearch] = useDebounceValue(searchValue, 500);
  const { accountId } = useThreads();

  React.useEffect(() => {
    if (!debouncedSearch || !accountId) return;
    search.mutateAsync({ accountId, query: debouncedSearch });
  }, [debouncedSearch, accountId]);

  const renderContent = () => {
    if (!searchValue) {
      return (
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500">Start typing to search emails...</p>
        </div>
      );
    }

    if (search.data?.hits.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500">
              No results found for "{searchValue}"
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Try different keywords or check your spelling
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {search.data?.hits.map((hit) => (
          <Card key={hit.id} className="transition-all hover:shadow-md">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium">
                    {hit.document.subject}
                  </h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="mr-2 h-4 w-4" />
                      <span className="mr-1 font-medium">From:</span>{" "}
                      {hit.document.from}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="mr-2 h-4 w-4" />
                      <span className="mr-1 font-medium">To:</span>
                      <div className="flex flex-wrap gap-1">
                        {hit.document.to.map((recipient: string) => (
                          <Badge
                            key={recipient}
                            variant="secondary"
                            className="text-xs"
                          >
                            {recipient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <div
                className="prose prose-sm mt-3 max-w-none text-sm text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(hit.document.rawBody, {
                    USE_PROFILES: { html: true },
                  }),
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <ScrollArea className="h-[calc(100vh-50px)]">
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">
            {searchValue && (
              <span className="text-gray-600">
                Results for "{searchValue}"
                {search.data && (
                  <span className="ml-2 text-sm text-gray-400">
                    ({search.data.hits.length}{" "}
                    {search.data.hits.length === 1 ? "result" : "results"})
                  </span>
                )}
              </span>
            )}
          </h2>
        </div>
        {renderContent()}
      </div>
    </ScrollArea>
  );
};

export default SearchDisplay;
