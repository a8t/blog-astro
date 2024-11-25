import React from "react";
import config from "@/config/config.json";
import dateFormat from "@/lib/utils/dateFormat";
import { humanize, slugify } from "@/lib/utils/textConverter";
import Fuse from "fuse.js";
import { useEffect, useRef, useState } from "react";
import { BiCalendarEdit, BiCategoryAlt } from "react-icons/bi";
import { IoPerson } from "react-icons/io5";
const { summary_length } = config.settings;

export type SearchItem = {
  slug: string;
  data: any;
  content: any;
};

export type ChordSearchItem = {
  slug: string;
  data: any;
  artist: string;
  content: any;
};

interface Props {
  postSearchList: SearchItem[];
  chordSearchList: ChordSearchItem[];
}

interface SearchResult {
  item: SearchItem;
  refIndex: number;
}

export default function SearchBar({ postSearchList, chordSearchList }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputVal, setInputVal] = useState("");

  const [chordSearchResults, setChordSearchResults] = useState<SearchResult[]>(
    [],
  );

  const [postSearchResults, setPostSearchResults] = useState<SearchResult[]>(
    [],
  );

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    setInputVal(e.currentTarget.value);
  };

  const postFuse = new Fuse(postSearchList, {
    keys: ["data.title", "data.categories"],
    includeMatches: true,
    minMatchCharLength: 2,
    threshold: 0.5,
  });

  const chordFuse = new Fuse(chordSearchList, {
    keys: ["data.title", "data.categories", "data.artist"],
    includeMatches: true,
    minMatchCharLength: 2,
    threshold: 0.5,
  });

  useEffect(() => {
    const searchUrl = new URLSearchParams(window.location.search);
    const searchStr = searchUrl.get("q");
    if (searchStr) setInputVal(searchStr);

    setTimeout(function () {
      inputRef.current!.selectionStart = inputRef.current!.selectionEnd =
        searchStr?.length || 0;
    }, 50);
  }, []);

  useEffect(() => {
    const postResults = postFuse.search(inputVal);
    setPostSearchResults(postResults);

    const chordResults = chordFuse.search(inputVal);
    setChordSearchResults(chordResults);
    // if (inputVal.length > 0) {
    //   const searchParams = new URLSearchParams(window.location.search);
    //   searchParams.set("q", inputVal);
    //   const newRelativePathQuery =
    //     window.location.pathname + "?" + searchParams.toString();
    //   history.replaceState(null, "", newRelativePathQuery);
    // } else {
    //   history.replaceState(null, "", window.location.pathname);
    // }
  }, [inputVal]);

  return (
    <div className="min-h-[45vh]">
      <input
        className="form-input w-full text-center"
        placeholder="Type here to Search posts"
        type="text"
        name="search"
        value={inputVal}
        onChange={handleChange}
        autoComplete="off"
        autoFocus
        ref={inputRef}
      />
      {inputVal.length > 1 && (
        <div className="my-6 text-center">
          Found {postSearchResults.length}
          {postSearchResults.length && postSearchResults.length === 1
            ? " post"
            : " posts"}{" "}
          and {chordSearchResults.length}
          {chordSearchResults.length && chordSearchResults.length === 1
            ? " chord chart"
            : " chord charts"}{" "}
          for '{inputVal}'
        </div>
      )}
      {chordSearchResults.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-4">Chords</h2>
          <div className="row">
            {chordSearchResults.map(({ item }) => (
              <div
                key={item.slug}
                className={"mb-8 bg-slate-100 p-8 rounded-md"}
              >
                <p className=" text-text text-sm flex pb-2">
                  <IoPerson className="mr-1 h-[18px] w-[18px] text-gray-600" />
                  {item.data.artist}
                </p>

                <h3 className="mb-2">
                  <a
                    href={`/${item.slug}`}
                    className="block hover:text-primary transition duration-300"
                  >
                    {item.data.title}
                  </a>
                </h3>
                <p className="text-text">
                  {item.data.description ??
                    (item.content?.slice(0, Number(summary_length)) +
                    (item.content?.length > Number(summary_length))
                      ? "..."
                      : "")}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
      <hr className="my-8" />
      {postSearchResults.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mb-4">Posts</h2>
          <div className="row">
            {postSearchResults.map(({ item }) => (
              <div
                key={item.slug}
                className={"mb-8 bg-slate-100 p-8 rounded-md"}
              >
                {item.data.image && (
                  <a
                    href={`/${item.slug}`}
                    className="rounded-lg block hover:text-primary overflow-hidden group"
                  >
                    <img
                      className="group-hover:scale-[1.03] transition duration-300 w-full"
                      src={item.data.image}
                      alt={item.data.title}
                      width={445}
                      height={230}
                    />
                  </a>
                )}

                <ul className="flex flex-wrap items-center text-text mb-2">
                  <li className="mr-5 flex items-center flex-wrap font-medium">
                    <BiCalendarEdit className="mr-1 h-5 w-5 text-gray-600" />
                    <>{dateFormat(item.data.date)}</>
                  </li>
                  {item.data.categories && (
                    <li className="mr-5 flex items-center flex-wrap">
                      <BiCategoryAlt className="mr-1 h-[18px] w-[18px] text-gray-600" />
                      <>
                        <ul>
                          {item.data.categories?.map(
                            (category: string, i: number) => (
                              <li key={i} className="inline-block">
                                <a
                                  href={`/categories/${slugify(category)}`}
                                  className="mr-2 hover:text-primary font-medium"
                                >
                                  {humanize(category)}
                                  {i !== item.data.categories.length - 1 && ","}
                                </a>
                              </li>
                            ),
                          )}
                        </ul>
                      </>
                    </li>
                  )}
                </ul>

                <h3 className="mb-2">
                  <a
                    href={`/${item.slug}`}
                    className="block hover:text-primary transition duration-300"
                  >
                    {item.data.title}
                  </a>
                </h3>
                <p className="text-text">
                  {item.data.description ??
                    (item.content?.slice(0, Number(summary_length)) +
                    (item.content?.length > Number(summary_length))
                      ? "..."
                      : "")}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
