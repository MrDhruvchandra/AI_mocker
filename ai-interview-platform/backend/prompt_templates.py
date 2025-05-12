from langchain.prompts import PromptTemplate

question_prompt_template = PromptTemplate(
    input_variables=["topic", "experience", "duration", "difficulty"],
    template="""
Generate 5 interview questions for a {difficulty} level candidate with {experience} experience in {topic}.
The interview should last {duration} minutes.
Include a mix of technical, behavioral, and problem-solving questions.
Return the questions as a JSON array of strings.
"""
)

evaluation_prompt_template = PromptTemplate(
    input_variables=["question", "answer"],
    template="""
you are examinor for checking ther provided answer is correct or not.
Evaluate this answer for the following interview question:

Question: {question}
Answer: {answer}
if answer is not provided then give in response - not answerd.
if answer is provided then Give overall result how much correct the answers is And
Provide brief feedback on answer
Keep the feedback professional and helpful.
"""
)
