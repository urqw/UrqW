import Client from "@/core/built/src/Client.js";

const fixture = `
:init1
instr тест=выфаячмсям
pln #тест$
btn выфв, тест кнопки
end

:init2
Пятачок=1
if Пятачок=1 then p Из дверей вышел поросёнок - друг медвежонка.#$&btn 26, Осмотреть Пятачка&btn 27, Поговорить с Пятачком
end
`;

describe("core/Client", () => {
  const client = Client.createGame('test', fixture, {});

  it("instr set value", () => {
    expect(client.text[0].text).toEqual("выфаячмсям");
    expect(client.buttons[0].desc).toEqual("тест кнопки");
    expect(client.buttons[0].id).toEqual(0);
    expect(client.buttons[0].command).toEqual("выфв");
  });

  it("if then", () => {
    client.Player.cls();

    client.Player.goto('init2', "GOTO");
    client.Player.continue();

    expect(client.text[0].text).toEqual("Из дверей вышел поросёнок - друг медвежонка. ");
    expect(client.buttons[0].desc).toEqual("Осмотреть Пятачка");
    expect(client.buttons[0].id).toEqual(0);
    expect(client.buttons[0].command).toEqual("26");
    expect(client.buttons[1].desc).toEqual("Поговорить с Пятачком");
    expect(client.buttons[1].id).toEqual(1);
    expect(client.buttons[1].command).toEqual("27");
  });

});
