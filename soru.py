import fitz
from tkinter import Tk, filedialog
import re
import json
import logging

logging.basicConfig(level=logging.ERROR)

def extract_text_from_pdf(pdf_path: str) -> str:
    try:
        doc = fitz.open(pdf_path)
        text = "".join(page.get_text() for page in doc)
        return text
    except Exception as e:
        logging.error(f"Error occurred while extracting text from PDF: {e}")
        return ""

def parse_questions(text: str) -> list:
    questions = []
    sections = re.split('CEVAP ANAHTARI', text)

    for section in sections[:-1]:  # Exclude the last section for answers
        lines = section.strip().split("\n")
        current_question = ""
        for line in lines:
            if re.match(r'^\d+\.\s', line):
                if current_question:
                    questions.append(current_question.strip())
                current_question = line.strip()
            else:
                current_question += " " + line.strip()

        if current_question:
            questions.append(current_question.strip())

    filtered_questions = [re.sub(r' (YDT|YKS|Deneme|DENEME|ydt|yks|YDS|yds).*', '', question).strip() for question in questions if re.search(r'[A-E]\)', question)]
    return filtered_questions

def parse_answers(text: str) -> dict:
    answers = {}
    sections = re.split('CEVAP ANAHTARI', text)

    if sections:
        answer_lines = sections[-1].split("\n")
        for line in answer_lines:
            if line.strip() and '.' in line:
                number, answer = line.split(".", 1)
                if number.isdigit():
                    answers[int(number)] = answer.strip()

    return answers

def create_html_file(questions: list, output_path: str = "src/quiz.html") -> None:
    try:
        questions_json = []
        for question in questions:
            question_parts = re.split(r'^\d+\.\s|([A-E]\))', question)
            question_text = question_parts[2].strip().replace('\n', '\\n').replace(';', ',') if len(question_parts) > 2 else ''
            options = re.findall(r'([A-E]\))\s*(.*?)\s*(?=[A-E]\)|\Z)', question)
            questions_json.append({
                "question": question_text,
                "options": [{"option": option[0], "text": option[1]} for option in options]
            })

        with open("questions.json", "w", encoding="utf-8") as questions_file:
            json.dump(questions_json, questions_file, indent=4)

        with open("src/template.html", "r", encoding="utf-8") as template_file:
            html_content = template_file.read()

        html_content = html_content.replace('{{ questions|safe }}', json.dumps(questions_json).replace('\\"', '\"'))

        with open(output_path, "w", encoding="utf-8") as file:
            file.write(html_content)

        print(f"HTML file '{output_path}' created successfully!")
    except Exception as e:
        logging.error(f"Error occurred while creating HTML file: {e}")

def main():
    try:
        root = Tk()
        root.withdraw()  # Hide the Tk window
        pdf_path = filedialog.askopenfilename(title="Select PDF File", filetypes=[("PDF files", "*.pdf")])
        if pdf_path:
            text = extract_text_from_pdf(pdf_path)
            questions = parse_questions(text)
            answers = parse_answers(text)
            with open("answers.json", "w", encoding="utf-8") as answers_file:
                json.dump(answers, answers_file, separators=(',', ':'))  # Minify JSON output
            create_html_file(questions)
    except Exception as e:
        logging.error(f"Error occurred: {e}")

if __name__ == "__main__":
    main()
