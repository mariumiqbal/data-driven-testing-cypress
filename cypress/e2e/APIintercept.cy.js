describe("verify data driven test", () => {
  let dob;
  it("should loop through users and validate form behavior", () => {
    cy.visit("https://apply.aut.ac.nz/");
    cy.get(".leftBox > div > .jss124 > .jss99").click();
    cy.fixture("userData.json").then((userData) => {
      userData.users.forEach((user) => {
        cy.get("#LegalFirstName").clear();
        cy.get("#LegalFamilyName").clear();
        cy.get("#Email").clear();

        cy.get("#Title").select(user.title);
        if (user.firstName && user.firstName !== "") {
          cy.get("#LegalFirstName").type(user.firstName);
        }
        if (user.lastName && user.lastName !== "") {
          cy.get("#LegalFamilyName").type(user.lastName);
        }
        if (user.email && user.email.trim() !== "") {
          cy.get("#Email").type(user.email);
        }
        if (user.dob && user.dob !== "") {
          dob = user.dob.split("-");
          cy.get("#birthDay").select(dob[2]);
          cy.get("#birthMonth").select(dob[1]);
          cy.get("#birthYear").select(dob[0]);
        }

        cy.get(`:nth-child(${user.genderIndex}) > label > span`).eq(0).click();

        if (user.country && user.country !== "") {
          cy.get("#ADCountryIDCitizen").select(user.country);
        }

        //Handle optional fields
        cy.get("body").then(($body) => {
          if ($body.find(".jss1 > :nth-child(8)").length > 0) {
            cy.get(".jss1 > :nth-child(8)").within(() => {
              cy.get(".radio-group > :nth-child(3) > label > span").click();
            });
          }
        });

        cy.get("body").then(($body) => {
          if ($body.find(".jss1 > :nth-child(9)").length > 0) {
            cy.get(".jss1 > :nth-child(9)").within(() => {
              cy.get(".radio-group > :nth-child(3) > label > span").click();
            });
          }
        });

        cy.intercept(
          "POST",
          "https://apply.aut.ac.nz/rc/application/services/identityCheck.php"
        ).as("APICheck");
        cy.get(
          '[style="margin-top: 50px; text-align: right; margin-right: 20px;"] > .jss124'
        ).click();
        cy.wait("@APICheck", { timeout: 20000 }).then((interception) => {
          cy.wait(1000).then(() => {
            if (
              !user.firstName ||
              !user.lastName ||
              !user.email ||
              !user.dob ||
              !user.country ||
              !user.genderIndex ||
              user.firstName === "" ||
              user.lastName === "" ||
              user.email.trim() === "" ||
              user.dob === "" ||
              user.country === ""
            ) {
              expect(interception.response.body.success).to.eq(false);
              // if any required field is empty, alert popup should appear
              cy.get("#alert-dialog-title > .jss210", {
                timeout: 30000,
              }).should("be.visible");
              cy.get(".completeNow").click();
              cy.get(".error_text", { timeout: 20000 }).should("be.visible");
            } else {
              expect(interception.response.statusCode).to.eq(200);
              expect(interception.response.body).to.have.property(
                "success",
                true
              );
              // if all required fields are filled, my progress is available
              cy.get(".myCourseSection", { timeout: 30000 }).should(
                "be.visible"
              );
              cy.get(".backBtn > .jss99").click();
            }
          });
        });
      });
    });
  });
});
