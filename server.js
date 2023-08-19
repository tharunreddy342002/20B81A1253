const express = require("express");
const axios = require("axios");

const app = express();
const port = 8008;
app.get("/numbers", handleNumbersRequest);

async function handleNumbersRequest(req, res) {
  const { url } = req.query;

  if (!url || !Array.isArray(url)) {
    return res
      .status(400)
      .json({ error: "URL parameter is missing or invalid." });
  }

  const validURLs = url.filter(isValidURL);

  if (validURLs.length === 0) {
    return res.status(400).json({ error: "No valid URLs found." });
  }

  try {
    const responses = await fetchNumbersFromURLs(validURLs);

    const mergedNumbers = mergeAndSortNumbers(responses);

    res.json({ numbers: mergedNumbers });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
}

function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

async function fetchNumbersFromURLs(urls) {
  const responsePromises = urls.map((validURL) => axios.get(validURL));

  const responses = await Promise.allSettled(
    responsePromises.map((promise) =>
      promise.then((result) => result.data.numbers).catch(() => null)
    )
  );

  return responses
    .filter(
      (response) => response.status === "fulfilled" && response.value !== null
    )
    .map((response) => response.value)
    .flat();
}

function mergeAndSortNumbers(arrays) {
  const merged = [].concat(...arrays);
  const uniqueSortedNumbers = Array.from(new Set(merged)).sort((a, b) => a - b);
  return uniqueSortedNumbers;
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});