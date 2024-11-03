export interface ITestCase {
  message: string;
  data: {
    input: string;
    output: string;
    isHidden: boolean;
  }[];
}
