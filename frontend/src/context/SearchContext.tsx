import { createContext, useState } from "react";

export interface SearchContextType {
  searchValue: string;
  setSearchValue: React.Dispatch<React.SetStateAction<string>>;
  submittedQuery: string;
  setSubmittedQuery: React.Dispatch<React.SetStateAction<string>>;
}

export const SearchContext = createContext<SearchContextType | undefined>(
  undefined,
);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [searchValue, setSearchValue] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  return (
    <SearchContext.Provider
      value={{ searchValue, setSearchValue, submittedQuery, setSubmittedQuery }}
    >
      {children}
    </SearchContext.Provider>
  );
};
