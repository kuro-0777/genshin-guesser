"use client";
import Image from "next/image";
import { useState } from "react";
import { Button, Select, SelectItem, Card, CardHeader } from "@heroui/react";
import characters from "./data/characters.json";

// Define a type for Genshin characters
type Character = {
  name: string;
  element: string | string[];
  weapon: string;
  rarity: number;
  region: string;
  // ...add other fields if needed
};

const questions = [
  {
    key: "element",
    label: "What is the character&apos;s element?",
    options: ["Anemo", "Cryo", "Dendro", "Electro", "Geo", "Hydro", "Pyro"],
  },
  {
    key: "weapon",
    label: "What weapon does the character use?",
    options: ["Sword", "Bow", "Claymore", "Polearm", "Catalyst"],
  },
  {
    key: "rarity",
    label: "What is the character&apos;s rarity?",
    options: ["4", "5"],
  },
  {
    key: "region",
    label: "Which region is the character from?",
    options: [
      "Mondstadt",
      "Liyue",
      "Inazuma",
      "Sumeru",
      "Fontaine",
      "Snezhnaya",
      "Natlan",
      "Traveler",
      "Nod-Krai",
    ],
  },
];

function filterCharacters(answers: Record<string, string>) {
  return (characters as Character[]).filter((char: Character) => {
    for (const q of questions) {
      if (!answers[q.key]) continue;

      // Special handling for element (array or string)
      if (q.key === "element") {
        if (Array.isArray(char.element)) {
          if (!char.element.includes(answers[q.key])) return false;
        } else {
          if (char.element !== answers[q.key]) return false;
        }
      }
      // Special handling for rarity
      else if (q.key === "rarity") {
        if (String(char[q.key as keyof Character]) !== answers[q.key])
          return false;
      }
      // Normal case
      else {
        if (char[q.key as keyof Character]?.toString() !== answers[q.key])
          return false;
      }
    }

    // Special case: Skirk is the only Traveler with Cryo + Sword
    if (
      answers.element === "Cryo" &&
      answers.weapon === "Sword" &&
      answers.region === "Traveler"
    ) {
      return char.name === "Skirk";
    }

    // Special case: Aether/Lumine are Traveler, Sword, and any element except Cryo
    if (
      answers.weapon === "Sword" &&
      answers.region === "Traveler" &&
      answers.element &&
      answers.element !== "Cryo"
    ) {
      return char.name === "Aether" || char.name === "Lumine";
    }

    return true;
  });
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showGuess, setShowGuess] = useState(false);

  const currentQuestion = questions[step];
  const filtered = filterCharacters(answers);

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.key]: value }));
  };

  const handleNext = () => {
    // If only one character remains after this step, skip to guess
    if (filtered.length === 1 || step === questions.length - 1) {
      setShowGuess(true);
    } else {
      setStep(step + 1);
    }
  };

  const handleRestart = () => {
    setStep(0);
    setAnswers({});
    setShowGuess(false);
  };

  return (
    <div className="font-sans min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/90 dark:bg-gray-900/90">
        <CardHeader className="flex flex-col items-center gap-2 pb-0">
          <h2 className="text-2xl font-bold text-center mt-2 text-gray-900">
            Genshin Character Guesser
          </h2>
        </CardHeader>
        <div className="p-4">
          {!showGuess ? (
            <div className="flex flex-col items-center justify-center">
              <div className="mb-8 w-full flex flex-col items-center">
                <div className="font-semibold mb-4 text-center text-lg text-gray-900">
                  {currentQuestion.label}
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  {currentQuestion.options.map((opt) => {
                    const colorMap: Record<string, string> = {
                      Anemo: "#30e0b7",
                      Cryo: "#7fd6f6",
                      Dendro: "#5fd35f",
                      Electro: "#b97cff",
                      Geo: "#ffd166",
                      Hydro: "#4faaff",
                      Pyro: "#ff7a3c",
                      Any: "#ff4d4f",
                      Mondstadt: "#30e0b7",
                      Liyue: "#ffd166",
                      Sumeru: "#5fd35f",
                      Inazuma: "#b97cff",
                      Fontaine: "#4faaff",
                      Natlan: "#ff7a3c",
                      Snezhnaya: "#7fd6f6",
                      Traveler: "#ff4d4f",
                    };
                    const bg =
                      answers[currentQuestion.key] === opt
                        ? colorMap[opt] || "#e5e7eb"
                        : "transparent";
                    const border =
                      answers[currentQuestion.key] === opt
                        ? "none"
                        : `2px solid ${colorMap[opt] || "#e5e7eb"}`;
                    const text =
                      answers[currentQuestion.key] === opt
                        ? "white"
                        : colorMap[opt] || "#111827";
                    return (
                      <Button
                        key={opt}
                        onClick={() => handleSelect(opt)}
                        style={{
                          background: bg,
                          border: border,
                          color: text,
                        }}
                        variant={
                          answers[currentQuestion.key] === opt
                            ? "solid"
                            : "bordered"
                        }
                        radius="lg"
                        size="lg"
                        className="min-w-[96px] font-semibold"
                      >
                        {opt}
                      </Button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-between w-full mt-2 gap-4">
                <Button
                  variant="flat"
                  onClick={handleRestart}
                  disabled={step === 0}
                  className="flex-1"
                  color="secondary"
                  radius="lg"
                >
                  Restart
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!answers[currentQuestion.key]}
                  className="flex-1"
                  color="primary"
                  radius="lg"
                >
                  {step === questions.length - 1 ? "Guess!" : "Next"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              {filtered.length === 0 && (
                <div className="text-center">
                  <div className="font-semibold text-lg mb-2 text-red-600">
                    No character found!
                  </div>
                  <div className="text-sm text-gray-500">
                    Try different answers.
                  </div>
                </div>
              )}
              {filtered.length === 1 && (
                <div className="text-center">
                  <div className="font-semibold text-lg mb-2 text-green-600">
                    You&apos;re thinking of:
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {filtered[0].name}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {filtered[0].element} • {filtered[0].weapon} •{" "}
                    {filtered[0].rarity}★ • {filtered[0].region}
                  </div>
                </div>
              )}
              {filtered.length > 1 && (
                <div className="text-center">
                  <div className="font-semibold text-lg mb-2 text-yellow-600">
                    Possible characters:
                  </div>
                  <ul className="text-base text-gray-700 font-medium">
                    {filtered.slice(0, 5).map((char: Character) => (
                      <li key={char.name}>{char.name}</li>
                    ))}
                  </ul>
                  {filtered.length > 5 && (
                    <div className="text-xs text-gray-400">
                      ...and {filtered.length - 5} more
                    </div>
                  )}
                </div>
              )}
              <Button
                className="mt-4 w-40"
                onClick={handleRestart}
                color="primary"
                radius="lg"
              >
                Play Again
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
