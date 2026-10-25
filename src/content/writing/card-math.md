# Making 6,843 with playing cards

In [this video](https://x.com/swyx/status/2113098033705664650), [Scott Wu](https://x.com/ScottWu46) from Cognition builds 6,843 with playing cards in seconds. The shortcut is to work backward from the target.

## The eight-card proof

The values are **12, 10, 10, 10, 8, 11, 7, 3**. Jacks count as 11 and queens as 12; the pictured suits are illustrative.

:::interactive{type="card-math"}
:::

Every card appears once:

$$
\begin{aligned}
208&=(12-10)\cdot10\cdot10+8,\\
6843&=(208\cdot11-7)\cdot3.
\end{aligned}
$$

## Work backward

First, $6843=3\cdot2281$. Then $2281=11\cdot208-7$. This reserves the **3**, **11**, and **7**. The rest follow from $208=200+8$ and $200=(12-10)\cdot10\cdot10$. Each step leaves a smaller target made from the cards still available.

## Why the solver works

For four cards, the tool records every integer reachable from each subset of cards. It combines two disjoint subsets with $+$, $-$, $\times$, or exact division, keeping one expression for each result.

This covers every allowed expression: its last operation must join two smaller expressions on disjoint sets of cards. Repeating that argument reaches the individual cards. So a result uses each card once, and a missing result cannot be made under these rules. The tool requires integer intermediate values; it does not use powers or join digits.
