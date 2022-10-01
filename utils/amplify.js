import { Amplify, Auth } from "aws-amplify";
import awsconfig from "../src/aws-exports";

export const amplifyInit = () => {
  Amplify.configure({
    ...awsconfig,
    ssr: true,
  });
};
