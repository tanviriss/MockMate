---
title: "Data Science Interview Questions: Complete Prep Guide (2026)"
description: "Prepare for data science interviews with this complete guide covering statistics, SQL, Python, machine learning, case studies, and behavioral questions with example answers."
category: "Role-Specific Interview Prep"
keywords: ["data science interview questions", "data scientist interview prep", "data science interview", "machine learning interview questions", "SQL interview questions data science", "statistics interview questions"]
author: "Reherse Team"
date: "2026-06-15"
readTime: "15 min read"
---

Data science interviews are uniquely challenging because they test breadth across multiple disciplines: statistics, programming, machine learning, business sense, and communication. You might answer a SQL query, derive a probability, explain a model to a non-technical stakeholder, and whiteboard an ML system — all in the same day.

This guide breaks down each interview type, the most common questions, and how to prepare systematically.

## The Typical Data Science Interview Process

### Stage 1: Recruiter Screen (20-30 minutes)

Standard background and motivation check. Be prepared to explain your data science journey and why this specific role interests you.

### Stage 2: Technical Screen (45-60 minutes)

Usually one of: SQL assessment, Python coding, or take-home analysis. Sometimes a statistics quiz.

### Stage 3: Onsite (Virtual or In-Person) — 4-5 Rounds

The mix varies by company, but typically includes:

- **SQL / Data Manipulation** (45 min)
- **Statistics and Probability** (45 min)
- **Machine Learning / Modeling** (45 min)
- **Case Study / Product Sense** (45 min)
- **Behavioral** (45 min)

## SQL and Data Manipulation

SQL is tested in almost every data science interview. Even if your day-to-day work uses Python or R, companies expect you to write clean, efficient SQL.

### Common SQL Questions

**Aggregation and Grouping:**
- "Write a query to find the top 5 customers by total revenue in the last 12 months."
- "Calculate the month-over-month growth rate for each product category."
- "Find users who made purchases in 3 or more consecutive months."

**Joins and Subqueries:**
- "Given tables for users, orders, and products, find all users who purchased every product in a given category."
- "Write a query to find the second-highest salary in each department."
- "Find customers who have placed orders but never made a return."

**Window Functions:**
- "Rank users by their total spending within each region."
- "Calculate the running average of daily active users over the past 7 days."
- "For each user, find the time between their first and second purchase."

**Data Quality:**
- "Write a query to identify duplicate records in a table."
- "Find all orders where the total doesn't match the sum of line items."
- "How would you handle NULL values in this analysis?"

### SQL Tips

- **Always clarify the schema.** Ask about table structure, data types, and relationships before writing.
- **Start simple, then optimize.** Get a working query first, then improve it.
- **Think about edge cases.** NULLs, duplicates, empty groups, date boundaries.
- **Use CTEs for readability.** Complex queries broken into CTEs are easier to debug and explain.
- **Know your window functions.** ROW_NUMBER, RANK, LAG, LEAD, and running aggregates appear constantly.

## Statistics and Probability

This round tests your understanding of fundamental concepts, not your ability to memorize formulas.

### Core Topics

**Probability:**
- Bayes' theorem and conditional probability
- Expected value calculations
- Common distributions (normal, binomial, Poisson)
- Independence vs. conditional independence

**Statistical Testing:**
- Hypothesis testing (null/alternative, p-values, significance)
- A/B testing design and analysis
- Type I and Type II errors (and their practical implications)
- Power analysis and sample size calculations
- Multiple testing correction

**Estimation:**
- Confidence intervals and their interpretation
- Maximum likelihood estimation
- Bias-variance trade-off
- Central limit theorem

### Sample Questions

**Probability:**
- "You flip a fair coin 10 times. What's the probability of getting exactly 7 heads?"
- "A test for a disease has a 95% sensitivity and 99% specificity. If 1% of the population has the disease, what's the probability someone who tests positive actually has it?"
- "You have two dice. What's the expected number of rolls to get a total of 7?"

**A/B Testing (extremely common):**
- "You run an A/B test and get a p-value of 0.04. Your manager asks if the result is meaningful. What do you say?"
- "How would you design an A/B test for a new checkout flow? What metrics would you track?"
- "Your A/B test shows the treatment group has higher revenue but lower conversion. What do you do?"
- "How long should you run an A/B test before calling it?"
- "How would you handle an A/B test where users can switch between groups?"

**Applied Statistics:**
- "What's the difference between correlation and causation? Give a real example."
- "When would you use a t-test vs. a chi-squared test vs. a Mann-Whitney U test?"
- "How would you detect if a metric's distribution changed after a product launch?"

### How to Answer Statistics Questions

1. **State your assumptions clearly.** "Assuming the samples are independent and normally distributed..."
2. **Walk through your reasoning.** Don't just give the formula — explain why you chose that approach.
3. **Connect to practical impact.** "A Type II error here means we'd miss a real improvement, so I'd want higher power even if it means a larger sample size."
4. **Be honest about what you don't know.** "I don't remember the exact formula, but the approach would be..." shows more maturity than guessing.

## Machine Learning

ML questions range from conceptual ("explain how random forests work") to practical ("how would you build a recommendation system for this product?").

### Conceptual Questions

- "Explain the bias-variance trade-off. How does it affect model selection?"
- "What's the difference between L1 and L2 regularization? When would you use each?"
- "How does gradient descent work? What can go wrong?"
- "Explain the difference between bagging and boosting."
- "What's the curse of dimensionality, and how do you deal with it?"
- "When would you use a neural network vs. a gradient boosted tree?"
- "How do you handle imbalanced classes?"
- "What's the difference between precision and recall? When does each matter more?"

### Applied ML Questions

- "How would you build a model to predict customer churn?"
- "Design a recommendation system for an e-commerce platform."
- "How would you detect fraudulent transactions in real time?"
- "Build a model to predict whether a user will click on an ad."
- "How would you approach a text classification problem with limited labeled data?"

### ML System Design (Senior Roles)

- "Design the ML pipeline for a content moderation system."
- "How would you build and deploy a real-time pricing model?"
- "Design a feature store for a large organization."
- "How would you set up model monitoring and alerting in production?"

### How to Answer ML Questions

**For conceptual questions:**
1. Explain the concept clearly (as if to a smart non-expert)
2. Give the intuition, not just the math
3. Discuss when you'd use it and when you wouldn't
4. Mention practical considerations (computational cost, interpretability, data requirements)

**For applied/design questions:**
1. Clarify the problem and success metric
2. Start with a simple baseline ("I'd start with logistic regression because...")
3. Discuss feature engineering
4. Explain model selection and why
5. Discuss evaluation methodology (cross-validation, holdout, online metrics)
6. Address deployment and monitoring

## Case Studies and Product Sense

This round tests your ability to frame problems, choose metrics, and communicate findings — the "so what?" of data science.

### Sample Questions

- "Engagement on the app dropped 10% this week. How would you investigate?"
- "Should we launch this new feature? Here's the A/B test data."
- "How would you measure the success of a new recommendation algorithm?"
- "The CEO wants to know if our marketing spend is effective. How would you analyze this?"
- "User retention has plateaued. What analysis would you do?"

### How to Approach Case Studies

1. **Clarify the question** (2 min): What's the business context? What decision depends on this analysis?
2. **Define metrics** (3 min): What are we measuring? Primary metric, guardrail metrics, secondary metrics.
3. **Hypothesize** (3 min): What could explain this? List 3-5 hypotheses.
4. **Design the analysis** (10 min): What data do you need? What would you look at first? What statistical tests?
5. **Discuss implications** (5 min): What would you recommend based on different outcomes?

### Common Mistakes in Case Studies

- **Jumping to ML.** Not every problem needs a model. Sometimes a SQL query and a chart is the right answer.
- **Ignoring the business context.** "Statistically significant" doesn't mean "worth doing." Always connect findings to business impact.
- **Not considering confounders.** Seasonality, selection bias, Simpson's paradox — always ask what else could explain the pattern.
- **Over-complicating.** Start with the simplest analysis that could answer the question.

## Python Coding

Some interviews include a Python round, testing data manipulation and programming fundamentals.

### Common Topics

- **Pandas:** Merging, grouping, pivoting, handling missing data
- **NumPy:** Array operations, vectorization
- **Data structures:** Dictionaries, sets, list comprehensions
- **Algorithms:** Sorting, searching, string manipulation
- **Statistical functions:** Writing your own mean, median, standard deviation

### Sample Questions

- "Write a function that calculates the moving average of a time series."
- "Given a dataset of user actions, find the most common sequence of 3 actions."
- "Implement k-means clustering from scratch."
- "Write a function to detect outliers using the IQR method."
- "Clean and aggregate this messy dataset (provided as a CSV)."

## Study Plan: 4-6 Weeks

### Weeks 1-2: Foundations
- **SQL:** Practice 30-40 problems on LeetCode or DataLemur
- **Statistics:** Review hypothesis testing, probability, distributions
- **Python:** Brush up on pandas operations and basic algorithms

### Weeks 3-4: Applied Skills
- **ML:** Review core algorithms, practice explaining them clearly
- **Case studies:** Practice 5-10 case studies (use product analytics scenarios)
- **A/B testing:** Deep dive into experiment design and analysis

### Weeks 5-6: Integration and Mock Interviews
- **Mock interviews:** Do at least 3-4 full mock interviews
- **System design:** For senior roles, practice ML system design
- **Behavioral:** Prepare 8 STAR stories focused on data-driven impact
- **Communication:** Practice explaining technical concepts to non-technical audiences

## Tips for Data Science Interviews

- **Always start with the business problem.** Don't jump to the technique. Ask "What decision are we trying to make?" before "What model should I use?"
- **Simple models first.** In both answers and practice, start with a baseline. Logistic regression before neural networks.
- **Quantify your impact.** "I built a model" is weak. "I built a churn prediction model that identified 80% of at-risk customers, saving $2M in annual revenue" is strong.
- **Know your portfolio.** Be ready to go deep on any project listed on your resume.
- **Practice explaining.** The best data scientists can explain complex ideas simply. Practice with non-technical friends.

> **Want to practice data science interview questions?** Reherse's AI coach generates role-specific questions and gives real-time feedback on your explanations and reasoning. [Start practicing →](/sign-up)

## The Bottom Line

Data science interviews are wide but not impossibly deep. You don't need to be an expert in every sub-field — you need solid fundamentals in SQL, statistics, and ML, combined with strong business sense and communication skills.

The candidates who stand out aren't the ones who know the most obscure techniques. They're the ones who can take a messy business question and turn it into a clear, actionable analysis. That's what the interview is really testing.
