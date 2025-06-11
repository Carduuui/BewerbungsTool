import styles from "./globals.css";

export default function Home() {
  return (
    <MyButton />
  );
}

function MyButton(){
  return(
    <button className="btnStyle border-solid text-red-500 border-2">I'm a button</button>
  );
}