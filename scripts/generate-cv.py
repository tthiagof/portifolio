from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, KeepTogether
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pathlib import Path
from shutil import copyfile
pdfmetrics.registerFont(TTFont('DejaVu','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
pdfmetrics.registerFontFamily('DejaVu',normal='DejaVu',bold='DejaVuBold')
ink=colors.HexColor('#20252c'); muted=colors.HexColor('#505862')
styles={
'name':ParagraphStyle('name',fontName='DejaVuBold',fontSize=24,leading=29,textColor=ink,spaceAfter=5),
'role':ParagraphStyle('role',fontName='DejaVuBold',fontSize=10,leading=15,textColor=ink,spaceAfter=8),
'contact':ParagraphStyle('contact',fontName='DejaVu',fontSize=8,leading=13,textColor=muted,spaceAfter=2),
'section':ParagraphStyle('section',fontName='DejaVuBold',fontSize=9,leading=13,textColor=ink,spaceBefore=14,spaceAfter=7),
'job':ParagraphStyle('job',fontName='DejaVuBold',fontSize=9,leading=14,textColor=ink,spaceAfter=5),
'body':ParagraphStyle('body',fontName='DejaVu',fontSize=8.5,leading=13,textColor=ink,spaceAfter=5),
'bullet':ParagraphStyle('bullet',fontName='DejaVu',fontSize=8.5,leading=13,textColor=ink,spaceAfter=5,leftIndent=10,firstLineIndent=-8),
}
story=[]
def add(text,style='body'):story.append(Paragraph(text,styles[style]))
add('THIAGO FERREIRA','name')
add('DESENVOLVIMENTO DE SISTEMAS | SERVIÇOS DE TI E AUTOMAÇÕES','role')
add('Santa Cruz do Sul - RS | (51) 99625-7816','contact')
add('<link href="mailto:thiagoferreira47691@gmail.com">thiagoferreira47691@gmail.com</link> | <link href="https://thiagof.cronosistemas.com">thiagof.cronosistemas.com</link>','contact')
add('PERFIL PROFISSIONAL','section')
add('Desenvolvedor e fundador da Crono Sistemas, com experiência em aplicações web, automações, serviços de TI, GitHub e CI/CD. Atuação em robótica móvel autônoma na seletiva WorldSkills de 2025, com algoritmos de controle e navegação, mecânica e estrutura, e programação e sistemas embarcados em C++ e Studica Robotics. Busco oportunidades em desenvolvimento, TI e robótica.')
add('ROBÓTICA E COMPETIÇÃO','section')
add('Programador de robótica móvel autônoma | SENAI / WorldSkills | 2025','job')
add('• Na seletiva WorldSkills, modalidade 23, atuei em algoritmos de controle e navegação, mecânica e estrutura e programação e sistemas embarcados, com C++ e Studica Robotics.','bullet')
add('EXPERIÊNCIA PROFISSIONAL','section')
add('Desenvolvedor e fundador | Crono Sistemas | 2026 - atual','job')
add('• Para atender às demandas digitais da Gruhn Elétrica, desenvolvi uma landing page, uma plataforma de cursos on-line e dois sistemas de ordens de serviço, voltados às manutenções terceirizadas e aos atendimentos do dia a dia.','bullet')
add('• Presto serviços de TI para a Gruhn Elétrica, com suporte técnico e acompanhamento da operação digital, além dos sistemas que desenvolvi para a empresa.','bullet')
add('• Para apoiar a apresentação e a venda dos cursos, desenvolvi uma automação no WhatsApp com apresentação das formações, respostas a dúvidas e orientação do cliente durante a compra.','bullet')
add('• Desenvolvo, para a Carevella, empresa de advocacia, uma plataforma voltada à automação de pesquisas genealógicas. <b>Projeto em andamento.</b>','bullet')
add('Assistente administrativo | TCS Consórcios | 2023 - 2024','job')
add('• Atendimento ao público, organização de documentos e trabalho com planilhas na rotina administrativa.','bullet')
add('FORMAÇÃO','section')
add('<b>Técnico em Desenvolvimento de Sistemas</b> | SENAI<br/>Fevereiro de 2025 a junho de 2027 (previsão)')
add('<b>Ensino Médio</b> | Conclusão prevista para 2026')
add('CONHECIMENTOS TÉCNICOS','section')
add('<b>Robótica:</b> algoritmos de controle e navegação, mecânica e estrutura, programação e sistemas embarcados, C++ e Studica Robotics.<br/><b>Desenvolvimento:</b> JavaScript, EJS, Fastify, Node.js, Bun, GitHub e CI/CD.<br/><b>Banco de dados e ambiente:</b> PostgreSQL e Docker.<br/><b>Ferramentas de escritório:</b> Pacote Office. <b>Idiomas:</b> inglês básico.')
add('CURSOS COMPLEMENTARES','section')
add('<b>Assistente Administrativo</b> — SENAI<br/><b>Robótica</b> — SENAI')
def page(canvas,doc):
 canvas.setFillColor(colors.HexColor('#e5bd35'));canvas.rect(40,791,515,3,fill=1,stroke=0)
 canvas.setStrokeColor(colors.HexColor('#d9dce0'));canvas.line(40,36,555,36)
 canvas.setFont('DejaVu',7);canvas.setFillColor(muted);canvas.drawString(40,24,'THIAGO FERREIRA | SISTEMAS E TI');canvas.drawRightString(555,24,str(doc.page))
out='output/pdf/thiago-ferreira-curriculo.pdf'
SimpleDocTemplate(out,pagesize=(595.28,841.89),rightMargin=40,leftMargin=40,topMargin=60,bottomMargin=48,title='Thiago Ferreira - Currículo',author='Thiago Ferreira').build(story,onFirstPage=page,onLaterPages=page)
copyfile(out,'documents/thiago-ferreira-curriculo.pdf')
