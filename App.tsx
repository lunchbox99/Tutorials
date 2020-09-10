import React, { useState } from 'react';
import { fetchQuizQuestions } from './API';
// Components
import QuestionCard from './components/QuestionCard';
// Types
import { QuestionState, Difficulty, Players } from './API';
// Styles
import { GlobalStyle, Wrapper } from './App.styles';

export type AnswerObject = {
    question: string;
    answer: string;
    correct: boolean;
    correctAnswer: string;
};

const TOTAL_QUESTIONS = 10;

const App = () => {
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<QuestionState[]>([]);
    const [number, setNumber] = useState(0);
    const [userAnswers, setUserAnswers] = useState<AnswerObject[]>([]);
    const [score, setScore] = useState(0);
    const [score2, setScore2] = useState(0);
    const [gameOver, setGameOver] = useState(true);
    // GSW
    const [players, setNumPlayers] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(TOTAL_QUESTIONS);
    const [playerOne, setPlayerOne] = useState(true);
    const [displayNumber, setDisplayNumber] = useState(0);

    const startTrivia = async (numPlayers: number) => {
        setTotalQuestions(TOTAL_QUESTIONS * numPlayers);
        setNumPlayers(numPlayers);
        if (numPlayers < 2) setPlayerOne(true);
        setLoading(true);
        setGameOver(false);
        // Add reset to setNumber GSW 9-4-2020
        setNumber(0);
        setDisplayNumber(0);
        const newQuestions = await fetchQuizQuestions(
            // GSW more players, more questions.
            totalQuestions * numPlayers,
            Difficulty.EASY,
        );

        setQuestions(newQuestions);
        setScore(0);
        setScore2(0);
        setUserAnswers([]);
        setLoading(false);
    }


        const checkAnswer = (e: React.MouseEvent<HTMLButtonElement>) => {
            if (!gameOver) {
                // Users answer
                const answer = e.currentTarget.value;
                // Check answer against correct answer
                const correct = questions[number].correct_answer === answer;
                // Add score if answer is correct
                if (correct && playerOne) setScore((prev) => prev + 1);
                if (correct && !playerOne) setScore2((prev) => prev + 1);
                // Save answer in the array for user answers

                const answerObject = {
                    question: questions[number].question,
                    answer,
                    correct,
                    correctAnswer: questions[number].correct_answer,
                };
                setUserAnswers((prev) => [...prev, answerObject]);
            }
        };

        const nextQuestion = () => {
            // Move on to the next question if not the last question
            // GSW
            if(players > 1) {
                playerOne ? setPlayerOne(false) : setPlayerOne(true);
                setDisplayNumber(Math.floor((number +1) / 2));
            } else {
                setDisplayNumber(number + 1);
            }

            const nextQuestion = number + 1;

            if (nextQuestion === totalQuestions) {
                setGameOver(true);
            } else {
                setNumber(nextQuestion);
            }


        }

        return (
            <>
                <GlobalStyle />
                <Wrapper>
                    <h1>REACT QUIZ</h1>
                    {gameOver || userAnswers.length === totalQuestions ? (
                        <div>
                            <button className="start" onClick={() => startTrivia(1)}>
                                1 Player
                            </button>
                            <button className="start" onClick={() => startTrivia(2)}>
                                2 Player
                            </button>
                        </div>
                    ) : null}
                    {!gameOver && (players < 2) ? <p className="score">Score: {score}</p> : null}
                    {!gameOver && (players > 1) ? <p className="score">Score One: {score}  Score Two: {score2}</p> : null}
                    {loading && <p>Loading Questions ...</p>}
                    {!loading && !gameOver && (
                        <QuestionCard
                            currentPlayer={playerOne ? Players.ONE : Players.TWO}
                            questionNr={ displayNumber + 1}
                            totalQuestions={(players > 1) ?  totalQuestions / 2 : totalQuestions}
                            question={questions[number].question}
                            answers={questions[number].answers}
                            userAnswer={userAnswers ? userAnswers[number] : undefined}
                            callback={checkAnswer}
                        />
                    )}
                    {!gameOver &&
                        !loading &&
                        userAnswers.length === number + 1 &&
                        number !== totalQuestions - 1 ? (
                            <button className="next" onClick={nextQuestion}>
                                Next Question
                            </button>
                        ) : null}
                </Wrapper>
            </>
        );
    }

    export default App;