import axios from "axios";


// export async function checkSpelling(text) {
//   try {
//     const response = await axios.post(
//       "https://api.languagetool.org/v2/check",
//       new URLSearchParams({ text, language: "en-US" }),
//       { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//     );

//     const matches = response.data.matches || [];

//     // Only misspellings
//     const misspelledWords = matches
//       .filter(m => m.rule.issueType === "misspelling")
//       .map(m => m.context.text.slice(m.context.offset, m.context.offset + m.context.length));

//     // Spelling score
//     let spellingScore = 2;
//     if (misspelledWords.length === 1) spellingScore = 1;
//     else if (misspelledWords.length >= 2) spellingScore = 0;

//     return { spellingScore, misspelledWords };
//   } catch (err) {
//     console.error(err);
//     return { spellingScore: 0, misspelledWords: [] };
//   }
// }

// Grammar check via LanguageTool API

export async function checkSpelling(text) {
  try {
    const response = await axios.post(
      "https://api.languagetool.org/v2/check",
      new URLSearchParams({ text, language: "en-US" }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const matches = response.data.matches || [];

    const spellingErrors = matches
      .filter(m => m.rule.issueType === "misspelling")
      .map(m => {
        const word = m.context.text.slice(
          m.context.offset,
          m.context.offset + m.context.length
        );

        return {
          word,
          suggestions: m.replacements.map(r => r.value) // ✅ suggestions added
        };
      });

    let spellingScore = 2;
    if (spellingErrors.length === 1) spellingScore = 1;
    else if (spellingErrors.length >= 2) spellingScore = 0;

    return { spellingScore, spellingErrors };
  } catch (err) {
    console.error(err);
    return { spellingScore: 0, spellingErrors: [] };
  }
}



// export async function getGrammarScore(text) {
//   try {
//     const response = await axios.post(
//       "https://api.languagetool.org/v2/check",
//       new URLSearchParams({
//         text,
//         language: "en-US",
//       }),
//       {
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//       }
//     );

//     const issues = response.data.matches || [];

//     // Extract the exact text of each mistake
//     const mistakeWords = issues.map(issue => issue.context.text.slice(issue.context.offset, issue.context.offset + issue.context.length));

//     // Scoring logic
//     let score = 2;
//     if (issues.length > 3) score = 0;
//     else if (issues.length > 0) score = 1;

//     return { score, issues: mistakeWords };
//   } catch (err) {
//     console.error("Grammar API error:", err.message);
//     return { score: 0, issues: [] };
//   }
// }

// Vocabulary scoring

export async function getGrammarScore(text) {
  try {
    const response = await axios.post(
      "https://api.languagetool.org/v2/check",
      new URLSearchParams({
        text,
        language: "en-US",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const issues = response.data.matches || [];

    const grammarIssues = issues.map(issue => {
      const incorrectText = issue.context.text.slice(
        issue.context.offset,
        issue.context.offset + issue.context.length
      );

      return {
        incorrectText,
        message: issue.message, // explanation
        suggestions: issue.replacements.map(r => r.value) // ✅ suggestions added
      };
    });

    let score = 2;
    if (issues.length > 3) score = 0;
    else if (issues.length > 0) score = 1;

    return { score, grammarIssues };
  } catch (err) {
    console.error("Grammar API error:", err.message);
    return { score: 0, grammarIssues: [] };
  }
}


export function getVocabularyScore(text) {
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  if (words.length < 10) return 0;

  const uniqueWords = [...new Set(words)];
  const ttr = uniqueWords.length / words.length;

  if (ttr < 0.5) return 1;
  return 2;
}
