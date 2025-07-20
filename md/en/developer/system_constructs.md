<!--
    Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
    This file is part of UrqW Documentation.
    SPDX-License-Identifier: CC-BY-SA-4.0
-->

# System Constructs

System Constructs (or Language Constructs) are predefined syntax elements of a programming language that provide basic operations and program execution control. They are an integral part of the language and offer developers ready-made mechanisms for solving typical tasks.

[[toc]]

## ##[character code]$

This construct is designed to display a character with the corresponding decimal code. For example:

```
pln Copyright ##169$ 2025 John Doe
```

This will display on the screen:

> Copyright © 2025 John Doe

This construct can be used for escaping characters. For example, you can escape the ampersand character to prevent it from being interpreted as [the & system construct](#%26):

```
btn office, Go to John Doe ##38$ Co. office
```

This will display a button with the name "Go to John Doe & Co. office" on the screen.

Direct use of the ampersand in the button name would result in incorrect code interpretation.

The character displayed using this construct is only suitable for screen output. It cannot be part of an [operator](operators.md).

## #$

This construct is designed to display a space character. For example:

```
pln one#$two
```

This will display on the screen:

> one two

As a rule, there are no issues with direct use of the space character. However, using this construct in some cases can improve the visual readability of the code.

This construct has a direct counterpart: [#%$](#%23%25%24).

## #%$

This construct is designed to display a space character. For example:

```
pln one#%$two
```

This will display on the screen:

> one two

As a rule, there are no issues with direct use of the space character. However, using this construct in some cases can improve the visual readability of the code.

This construct has a direct counterpart: [#$](#%23%24).

## #%/$

This construct is designed to create a line break. For example:

```
pln one#%/$two
```

This will display on the screen:

> one \
> two

This construct has a direct counterpart: [#/$](#%23%2F%24).

## #%[variable]$

This construct is designed to display the value of a variable of any type. For example:

```
item = "apples"
quantity = 5
pln I have #%quantity$ #%item$.
```

This will display on the screen:

> I have 5 apples.

This construct has a direct counterpart: [#[variable]$](#%23%5Bvariable%5D%24).

## #/$

This construct is designed to create a line break. For example:

```
pln one#/$two
```

This will display on the screen:

> one \
> two

This construct has a direct counterpart: [#%/$](#%23%25%2F%24).

## #[variable]$

This construct is designed to display the value of a variable of any type. For example:

```
item = "apples"
quantity = 5
pln I have #quantity$ #item$.
```

This will display on the screen:

> I have 5 apples.

This construct has a direct counterpart: [#%[variable]$](#%23%25%5Bvariable%5D%24).

## &

This construct is designed to combine multiple [operators](operators.md) into a single command. For example:

```
btn inv+ Screwdriver & cls & goto garage, Take a screwdriver and go to the garage
```

This will display a button with the name "Take a screwdriver and go to the garage" on the screen, which, when clicked, will execute 3 actions simultaneously:

1. The item "Screwdriver" will be added to the inventory using the [inv+](operators.md#inv%2B-%7Bquantity%2C%7D-%5Bitem%5D) operator.
2. The screen will be cleared using the [cls](operators.md#cls) operator.
3. The transition to the "garage" label will occur using the [goto](operators.md#goto-%5Blabel%5D) operator.

Please note that in some cases, it may be preferable to create and call a procedure with multiple actions using the [proc](operators.md#proc-%5Blabel%5D) operator.

## /* {comment} */

This construct is designed to add comments to the program code. For example:

```
/* This is text that will be ignored */
pln Hello, World!
/*
This is text
that will be ignored
*/
```

This will display on the screen:

> Hello, World!
 
 Comments are designed to add explanations and notes to the program code. Additionally, the commenting mechanism allows temporarily excluding parts of the code from program execution while preserving them for future use.

Please note that it is important to both open the comment block with the symbols "`/*`" and close it with the symbols "`*/`". This construct requires both of these elements.
