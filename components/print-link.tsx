export function PrintLink({
  id = "print-document",
  children = "Print or save as PDF",
}: {
  id?: string;
  children?: string;
}) {
  return (
    <>
      <a href={`#${id}`} className="text-teal" id={id}>
        {children}
      </a>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.getElementById(${JSON.stringify(id)})?.addEventListener("click",function(e){e.preventDefault();window.print();});`,
        }}
      />
    </>
  );
}
