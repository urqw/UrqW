<!--
    Copyright (C) 2025 Nikita Tseykovets <tseikovets@rambler.ru>
    This file is part of UrqW Documentation.
    SPDX-License-Identifier: CC-BY-SA-4.0
-->

# operators

Operator is a special symbol, keyword, or construct that performs a specific action on data (operands) or operates independently without them. It represents the minimal autonomous unit of program code.

[[toc]]

## Quick Reference of Operators for Typical Actions

### Arithmetic Operators

* Addition: [`+`](#%2B)
* Subtraction: [`-`](#-)
* Multiplication: [`*`](#*)
* Division: [`/`](#%2F)

### Comparison Operators

* Equal: [`=`](#%3D)
* Not Equal: [`!=`](#!%3D) or [`<>`](#%3C%3E)
* String Mask Comparison: [`==`](#%3D%3D)
* Less Than: [`<`](#%3C)
* Greater Than: [`>`](#%3E)
* Less Than or Equal: [`<=`](#%3C%3D)
* Greater Than or Equal: [`>=`](#%3E%3D)

### Logical Operators

* Negation (Logical NOT): [`not`](#not)
* Conjunction (Logical AND): [`&&`](#%26%26) or [`and`](#and)
* Disjunction (Logical OR): [`||`](#%7C%7C) or [`or`](#or)

## Precedence of Operations

Operators in descending order of precedence:

1. [`(`](#(-)) --- Opening Grouping Parenthesis
2. [`)`](#(-)) --- Closing Grouping Parenthesis
3. [`not`](#not) --- Negation (Logical NOT)
4. [`*`](#*) --- Multiplication
5. [`/`](#%2F) --- Division
6. [`+`](#%2B) --- Addition
7. [`-`](#-) --- Subtraction
8. [`<`](#%3C) --- Less Than
9. [`<=`](#%3C%3D) --- Less Than or Equal
10. [`>`](#%3E) --- Greater Than
11. [`>=`](#%3E%3D) --- Greater Than or Equal
12. [`=`](#%3D) --- Equal
13. [`==`](#%3D%3D) --- String Mask Comparison
14. [`!=`](#!%3D) --- Not Equal
15. [`<>`](#%3C%3E) --- Not Equal
16. [`&&`](#%26%26) --- Conjunction (Logical AND)
17. [`and`](#and) --- Conjunction (Logical AND)
18. [`||`](#%7C%7C) --- Disjunction (Logical OR)
19. [`or`](#or) --- Disjunction (Logical OR)

## Complete Reference of Operators with Details

### -

### !=

### &&

### ( )

### *

### /

### :[label]

### [[ text {| label or actions }]]

### ||

### +

### <

### <=

### <>

### =

### ==

### >

### >=

### and

### anykey {variable}

### btn [label or actions], [text]

### cls

### clsb

### end

### else

### forget_procs

### goto [label]

### if [condition] then [actions then] {else [actions else]}

### image [file]

### input [variable]

### inv- {quantity,} [item]

### inv+ {quantity,} [item]

### invkill {item}

### javascript [code]

### music [file]

### not

### or

### p {text}

### pause [number of milliseconds]

### perkill

### play [file]

### pln {text}

### print {text}

### println {text}

### proc [label]

### quit

### save

### then
