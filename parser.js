(function attachTaskParser(global) {
  const SUBJECTS = [
    "Math",
    "Science",
    "English",
    "History",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer",
    "Geography",
  ];

  const TASK_TYPES = ["homework", "exam", "project", "assignment", "quiz"];

  const WEEK_DAYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  function parseTaskInput(rawText, selectedDate) {
    const taskParts = splitIntoTaskParts(rawText);
    return taskParts
      .map((part) => parseTaskDetails(part, selectedDate))
      .filter((item) => item.title);
  }

  function splitIntoTaskParts(rawText) {
    const lines = rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const hasBullets = lines.some((line) => /^([-*•]|\d+[.)])\s+/.test(line));
    const baseParts = hasBullets ? lines : [rawText];
    const taskParts = [];

    for (const part of baseParts) {
      const withoutBullet = part.replace(/^([-*•]|\d+[.)])\s+/, "").trim();
      const splits = withoutBullet
        .split(/\s*(?:,(?!\s*\d{4}\b)|\band\b)\s+/i)
        .map((item) => item.trim())
        .filter(Boolean);

      if (splits.length > 1) {
        taskParts.push(...splits);
      } else if (withoutBullet) {
        taskParts.push(withoutBullet);
      }
    }

    return taskParts.length ? taskParts : [rawText];
  }

  function parseTaskDetails(inputText, selectedDate) {
    let cleanedText = inputText.trim();
    const subject = detectSubject(cleanedText);
    const type = detectTaskType(cleanedText);
    const dateInfo = detectDueDate(cleanedText, selectedDate);

    if (subject) {
      cleanedText = cleanedText.replace(new RegExp(`\\b${subject}\\b`, "i"), " ");
    }

    if (type) {
      cleanedText = cleanedText.replace(new RegExp(`\\b${type}\\b`, "i"), " ");
    }

    if (dateInfo.matchedText) {
      cleanedText = cleanedText.replace(new RegExp(escapeRegExp(dateInfo.matchedText), "i"), " ");
    }

    cleanedText = cleanedText
      .replace(/\b(by|on|due|for|next)\b/gi, " ")
      .replace(/[,:-]/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim();

    let fallbackTitle = inputText.trim();
    if (!cleanedText) {
      if (subject && type) {
        fallbackTitle = `${subject} ${type.charAt(0).toUpperCase() + type.slice(1)}`;
      } else if (subject) {
        fallbackTitle = `${subject} Task`;
      } else if (type) {
        fallbackTitle = `${type.charAt(0).toUpperCase() + type.slice(1)}`;
      }
    }

    return {
      title: cleanedText || fallbackTitle,
      subject,
      type,
      dueDate: dateInfo.isoDate,
    };
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function detectSubject(inputText) {
    for (const subject of SUBJECTS) {
      const subjectRegex = new RegExp(`\\b${subject}\\b`, "i");
      if (subjectRegex.test(inputText)) {
        return subject;
      }
    }
    return "";
  }

  function detectTaskType(inputText) {
    for (const taskType of TASK_TYPES) {
      const typeRegex = new RegExp(`\\b${taskType}\\b`, "i");
      if (typeRegex.test(inputText)) {
        return taskType;
      }
    }
    return "";
  }

  function detectDueDate(inputText, selectedDate) {
    if (selectedDate) {
      return { isoDate: selectedDate, matchedText: "" };
    }

    const lowerText = inputText.toLowerCase();
    const now = new Date();
    let targetDate = null;
    let matchedText = "";

    const tomMatch = inputText.match(/\btomorrow\b/i);
    if (tomMatch) {
      matchedText = tomMatch[0];
      targetDate = new Date(now);
      targetDate.setDate(now.getDate() + 1);
    } else {
      const todMatch = inputText.match(/\btoday\b/i);
      if (todMatch) {
        matchedText = todMatch[0];
        targetDate = new Date(now);
      } else {
        const nextDayMatch = inputText.match(
          /\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i
        );
        if (nextDayMatch) {
          matchedText = nextDayMatch[0];
          targetDate = getNextWeekdayDate(
            now,
            WEEK_DAYS.indexOf(nextDayMatch[1].toLowerCase()),
            true
          );
        }
      }
    }

    if (!targetDate) {
      for (const day of WEEK_DAYS) {
        const dayRegex = new RegExp(`\\b${day}\\b`, "i");
        if (dayRegex.test(lowerText)) {
          const match = inputText.match(dayRegex);
          matchedText = match ? match[0] : day;
          targetDate = getNextWeekdayDate(now, WEEK_DAYS.indexOf(day), false);
          break;
        }
      }
    }

    if (!targetDate) {
      const isoMatch = inputText.match(/\b\d{4}-\d{2}-\d{2}\b/);
      if (isoMatch) {
        matchedText = isoMatch[0];
        targetDate = parseISODate(isoMatch[0]);
      }
    }

    if (!targetDate) {
      const slashMatch = inputText.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{2,4})\b/);
      if (slashMatch) {
        matchedText = slashMatch[0];
        const month = Number(slashMatch[1]);
        const day = Number(slashMatch[2]);
        const year = normalizeYear(slashMatch[3]);
        targetDate = new Date(year, month - 1, day);
      }
    }

    if (!targetDate) {
      const monthNameMatch = inputText.match(
        /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(?:,\s*(\d{4}))?\b/i
      );
      if (monthNameMatch) {
        matchedText = monthNameMatch[0];
        const monthIndex = new Date(`${monthNameMatch[1]} 1, 2000`).getMonth();
        const day = Number(monthNameMatch[2]);
        const year = monthNameMatch[3]
          ? Number(monthNameMatch[3])
          : now.getFullYear();
        targetDate = new Date(year, monthIndex, day);
      }
    }

    if (!targetDate || Number.isNaN(targetDate.getTime())) {
      return { isoDate: "", matchedText: "" };
    }

    return { isoDate: toISODate(targetDate), matchedText };
  }

  function normalizeYear(yearText) {
    const value = Number(yearText);
    return yearText.length === 2 ? 2000 + value : value;
  }

  function getNextWeekdayDate(fromDate, dayIndex, strictNextWeek) {
    const result = new Date(fromDate);
    const currentDayIndex = fromDate.getDay();
    let daysUntil = (dayIndex - currentDayIndex + 7) % 7;
    // If today is that weekday, always move to next week's occurrence.
    // "next Friday" and "Friday" both resolve to the upcoming Friday
    // (do not skip an extra week when Friday is still later this week).
    if (daysUntil === 0) {
      daysUntil = 7;
    }
    void strictNextWeek;
    result.setDate(fromDate.getDate() + daysUntil);
    return result;
  }

  function toISODate(dateValue) {
    const year = dateValue.getFullYear();
    const month = String(dateValue.getMonth() + 1).padStart(2, "0");
    const day = String(dateValue.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDateLabel(dateValue) {
    return dateValue.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function parseISODate(isoDate) {
    const [year, month, day] = isoDate.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  global.TaskParser = {
    parseTaskInput,
    parseISODate,
    formatDateLabel,
    toISODate,
  };
})(window);
