describe('Agenda de Compromissos (E2E)', () => {
  const baseUrl = 'http://localhost:4200';

  beforeEach(() => {
    cy.visit(baseUrl);
    cy.get('app-agenda-list').should('exist');
  });

  it('Deve criar um novo compromisso com sucesso', () => {
    cy.intercept('POST', '**').as('salvarRequisicao');
    cy.contains('button', 'Novo').click();
    cy.get('.p-dialog-content, p-dialog').should('be.visible');
    cy.get('input[formcontrolname="titulo"], input[placeholder="Ex: Daily Scrum"]')
      .should('be.visible')
      .clear()
      .type('Daily Scrum Teste');

    cy.get('p-dropdown[formcontrolname="tipo"], p-select[formcontrolname="tipo"]')
      .click();

    cy.get('li[role="option"], p-dropdownitem')
      .contains('Reunião')
      .should('be.visible')
      .click();

    const dataAtual = new Date();
    const dia = String(dataAtual.getDate()).padStart(2, '0');
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    const ano = dataAtual.getFullYear();

    const hoje = `${dia}/${mes}/${ano}`;

    cy.get('p-dialog:visible p-datepicker').as('datepickers');
    cy.get('p-dialog:visible p-datepicker').eq(0).find('input')
      .click()
      .clear()
      .type(`${hoje} 09:00{enter}`);
    cy.get('p-dialog .p-dialog-title')
      .click({ force: true });

    cy.get('p-dialog:visible p-datepicker').eq(1).find('input')
      .should('be.visible')
      .click()
      .clear()
      .type(`${hoje} 10:00{enter}`);
    cy.get('p-dialog .p-dialog-title')
      .click({ force: true });

    cy.get('p-autoComplete[formcontrolname="local"] input')
      .should('be.visible')
      .clear()
      .type('Sala de Reunião');

    cy.get('p-autoComplete[formcontrolname="participantes"] input')
      .type('cypress@teste.com{enter}');

    cy.get('button[type="submit"]')
      .should('not.be.disabled')
      .contains('Salvar Compromisso')
      .click();

    cy.get('p-dialog[header="Novo Agendamento"]').should('not.exist');

  });
});
