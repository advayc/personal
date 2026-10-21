import type { GetServerSideProps } from "next";
export const getServerSideProps: GetServerSideProps = async () => ({
  redirect: { destination: "/systems", permanent: true },
});
export default function Machines() {
  return null;
}
