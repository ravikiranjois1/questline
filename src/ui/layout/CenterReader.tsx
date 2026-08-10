import type { CourseItem } from '../../engine/types';

interface CenterReaderProps {
  chapterTitle: string | null;
  item: CourseItem | null;
}

export function CenterReader({ chapterTitle, item }: CenterReaderProps) {
  return (
    <main
      id="main-content"
      className="h-full overflow-y-auto bg-slate-50 p-6 dark:bg-slate-950"
      tabIndex={-1}
    >
      {!item ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Select a lab from the chapter tree to view its content.
        </p>
      ) : (
        <>
          <nav aria-label="Breadcrumb" className="mb-4 text-xs text-slate-500 dark:text-slate-400">
            <ol className="flex items-center gap-1">
              {chapterTitle && <li>{chapterTitle}</li>}
              {chapterTitle && <li aria-hidden="true">/</li>}
              <li className="font-medium text-slate-700 dark:text-slate-300">{item.title}</li>
            </ol>
          </nav>

          <article className="prose prose-slate dark:prose-invert max-w-none">
            <h1>{item.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Markdown rendering (remark-gfm + mermaid + shiki) lands in P2. Content files for this item:
            </p>
            <ul>
              {item.content.map((path) => (
                <li key={path}>
                  <code>{path}</code>
                </li>
              ))}
            </ul>
          </article>
        </>
      )}
    </main>
  );
}
