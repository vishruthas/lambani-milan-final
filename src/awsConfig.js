import { Amplify } from "aws-amplify";

Amplify.configure({
  Auth: {
    Cognito:{
      userPoolId: "ap-south-1_LWVs7XrXT",
      userPoolClientId: "6f06lhocurrpdh5jdicplske0t",
      region: "ap-south-1",
    }    
  }
});