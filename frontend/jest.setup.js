const fetchMock = require("jest-fetch-mock");

fetchMock.enableMocks();//changes global fetch.
//instead of using the real network fetch, Jest now uses a fake fetch provided by jest-fetch-mock, which allows us to control and mock the responses for our tests. This is useful for testing how our code handles different scenarios without making actual network requests.


jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock"),
);