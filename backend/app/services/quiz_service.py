import re
import hashlib
from difflib import SequenceMatcher
from typing import List, Tuple, Optional, Set
from app.schemas.quiz import QuestionItem

STOP_WORDS = {
    "what", "is", "the", "of", "a", "an", "which", "are", "to", "for", "in", "by", 
    "from", "on", "that", "this", "with", "as", "at", "it", "following", "true", 
    "correct", "statement", "given", "select", "choose", "one", "all", "always",
    "used", "find", "gives", "using", "calculate", "determine", "represents", "call", "how"
}

LATEX_REPLACEMENTS = {
    r'\lambda': 'lambda',
    r'\det': 'det',
    r'\sum': 'sum',
    r'\prod': 'prod',
    r'\alpha': 'alpha',
    r'\beta': 'beta',
    r'\pi': 'pi',
    r'\theta': 'theta',
    r'\omega': 'omega',
    r'\times': 'times',
    r'\neq': 'neq',
}

OPPOSITE_OR_DISTINCT_PAIRS = [
    ({"sum", "trace"}, {"product", "determinant", "det"}),
    ({"eigenvalue", "eigenvalues"}, {"eigenvector", "eigenvectors"}),
    ({"maximum", "max"}, {"minimum", "min"}),
    ({"increase", "increasing"}, {"decrease", "decreasing"}),
    ({"singular"}, {"non-singular", "invertible"}),
    ({"implicit"}, {"explicit"}),
]

def stem_word(w: str) -> str:
    """Lightweight rule-based stemmer for English & technical terms."""
    if len(w) <= 3:
        return w
    w = re.sub(r'(tions|tion|ments|ment|ings|ing|able|ably|ize|ized|ised|ises|ed|es|s)$', '', w)
    w = re.sub(r'i$', '', w)
    return w

def clean_latex(text: str) -> str:
    """Strips LaTeX formatting while preserving mathematical symbol names."""
    cleaned = text
    for cmd, repl in LATEX_REPLACEMENTS.items():
        cleaned = cleaned.replace(cmd, repl)
    cleaned = re.sub(r'\\text\{([^}]+)\}', r'\1', cleaned)
    cleaned = re.sub(r'\\mathbf\{([^}]+)\}', r'\1', cleaned)
    cleaned = re.sub(r'\\boxed\{([^}]+)\}', r'\1', cleaned)
    cleaned = re.sub(r'\\[a-zA-Z]+', ' ', cleaned)
    cleaned = re.sub(r'[\$\{\}\\\^_\*\+\-\/\=\(\)\[\]]', ' ', cleaned)
    return cleaned

def normalize_stem(text: str) -> str:
    """Converts question stem into canonical semantic token string."""
    cleaned = clean_latex(text.lower())
    cleaned = re.sub(r'[^a-z0-9\s]', ' ', cleaned)
    tokens = [stem_word(t) for t in cleaned.split() if t not in STOP_WORDS]
    return " ".join(tokens)

def compute_question_fingerprint(text: str) -> str:
    """Computes a deterministic 16-hex fingerprint hash from normalized stem."""
    norm = normalize_stem(text)
    return hashlib.sha256(norm.encode('utf-8')).hexdigest()[:16]

def are_questions_duplicate(q1: str, q2: str) -> bool:
    """
    Determines if two questions are duplicates or paraphrases of each other.
    Protects distinct concepts from false-positive collisions.
    """
    norm1 = normalize_stem(q1)
    norm2 = normalize_stem(q2)
    
    if norm1 == norm2 and norm1:
        return True
        
    t1 = set(norm1.split())
    t2 = set(norm2.split())
    if not t1 or not t2:
        return False
        
    intersection = t1 & t2
    union = t1 | t2
    jaccard = len(intersection) / len(union) if union else 0.0
    min_len = min(len(t1), len(t2))
    containment = len(intersection) / min_len if min_len > 0 else 0.0
    seq = SequenceMatcher(None, norm1, norm2).ratio()
    
    # Check for distinct / conflicting focal concepts (e.g. Sum vs Product)
    for set_a, set_b in OPPOSITE_OR_DISTINCT_PAIRS:
        has_a1 = bool(t1 & {stem_word(x) for x in set_a})
        has_b1 = bool(t1 & {stem_word(x) for x in set_b})
        has_a2 = bool(t2 & {stem_word(x) for x in set_a})
        has_b2 = bool(t2 & {stem_word(x) for x in set_b})
        if (has_a1 and not has_b1 and has_b2 and not has_a2) or (has_b1 and not has_a1 and has_a2 and not has_b2):
            return False
            
    # Duplicate detected if containment >= 0.70, jaccard >= 0.55, or sequence ratio >= 0.78
    if containment >= 0.70 or jaccard >= 0.55 or seq >= 0.78:
        return True
        
    return False

def deduplicate_quiz_batch(questions: List[QuestionItem]) -> List[QuestionItem]:
    """
    Removes exact and near-duplicates within a single quiz batch.
    Preserves the first occurrence of each unique question.
    """
    unique: List[QuestionItem] = []
    seen_fingerprints: Set[str] = set()
    
    for q in questions:
        fp = compute_question_fingerprint(q.question)
        if fp in seen_fingerprints:
            continue
            
        # Check against already accepted questions in this batch
        is_dup = False
        for accepted in unique:
            if are_questions_duplicate(q.question, accepted.question):
                is_dup = True
                break
                
        if not is_dup:
            seen_fingerprints.add(fp)
            unique.append(q)
            
    return unique

def filter_against_history(
    candidates: List[QuestionItem],
    excluded_fingerprints: Set[str],
    excluded_stems: List[str]
) -> List[QuestionItem]:
    """
    Filters candidate questions against student attempt history.
    Rejects any question whose fingerprint or stem matches previous attempts.
    """
    fresh: List[QuestionItem] = []
    for q in candidates:
        fp = compute_question_fingerprint(q.question)
        if fp in excluded_fingerprints:
            continue
            
        is_dup = False
        for prev_stem in excluded_stems:
            if are_questions_duplicate(q.question, prev_stem):
                is_dup = True
                break
                
        if not is_dup:
            fresh.append(q)
            
    return fresh

