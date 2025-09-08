import Link from "next/link";

export default function Page() {
  return (
    <div>
      <h1>page 1!</h1>
      <Link href="/">Go back</Link>
      <Link href="/posts/page2">Go page 2</Link>
    </div>
  );
}