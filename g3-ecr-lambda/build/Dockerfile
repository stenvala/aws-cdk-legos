FROM public.ecr.aws/lambda/python:3.8

COPY dist ./

RUN pip install -r requirements.txt

CMD [ "main.handler" ]