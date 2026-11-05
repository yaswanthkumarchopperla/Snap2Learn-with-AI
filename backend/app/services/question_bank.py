from typing import List, Dict, Tuple, Optional, Set
from app.schemas.quiz import QuestionItem
from app.services.quiz_service import compute_question_fingerprint, are_questions_duplicate

# Multi-topic, multi-difficulty curated question bank for reliable fallback and retake variety
QUESTION_BANK: Dict[str, Dict[str, List[QuestionItem]]] = {
    # -------------------------------------------------------------
    # 1. Engineering Mathematics: Linear Algebra & Eigenvalues
    # -------------------------------------------------------------
    "linear_algebra": {
        "easy": [
            QuestionItem(
                id="math-easy-1",
                question="What is the necessary condition for a non-zero column vector $v$ to be an eigenvector of square matrix $A$?",
                options=[
                    "$A v = \\lambda v$ for some scalar $\\lambda$",
                    "$A v = 0$ for all vectors",
                    "$\\det(A) = 0$",
                    "$A^T = A$"
                ],
                correct_index=0,
                explanation="By definition, a non-zero vector $v$ is an eigenvector of $A$ if $Av$ is a scalar multiple $\\lambda v$, where $\\lambda$ is the eigenvalue.",
                topic_tag="Eigenvector Definition"
            ),
            QuestionItem(
                id="math-easy-2",
                question="Which determinant equation gives the characteristic equation of matrix $A$?",
                options=[
                    "$\\det(A - \\lambda I) = 0$",
                    "$\\det(A + \\lambda I) = 1$",
                    "$\\det(A) = \\lambda$",
                    "$\\text{Trace}(A) = \\lambda$"
                ],
                correct_index=0,
                explanation="For $(A - \\lambda I)v = 0$ to possess a non-trivial solution ($v \\neq 0$), $(A - \\lambda I)$ must be singular, giving $\\det(A - \\lambda I) = 0$.",
                topic_tag="Characteristic Equation"
            ),
            QuestionItem(
                id="math-easy-3",
                question="The sum of all eigenvalues of an $n \\times n$ matrix is always equal to:",
                options=[
                    "The Trace of the matrix (sum of main diagonal elements)",
                    "The Determinant of the matrix",
                    "Zero",
                    "The Rank of the matrix"
                ],
                correct_index=0,
                explanation="A fundamental linear algebra theorem states that the sum of the eigenvalues equals the trace: $\\sum \\lambda_i = \\text{Trace}(A)$.",
                topic_tag="Trace Property"
            ),
            QuestionItem(
                id="math-easy-4",
                question="The product of all eigenvalues of a square matrix $A$ equals:",
                options=[
                    "$\\det(A)$",
                    "$\\text{Trace}(A)$",
                    "1",
                    "0"
                ],
                correct_index=0,
                explanation="The constant term of the characteristic polynomial shows that $\\prod \\lambda_i = \\det(A)$.",
                topic_tag="Determinant Property"
            ),
            QuestionItem(
                id="math-easy-5",
                question="What are the eigenvalues of an $n \\times n$ Identity matrix $I_n$?",
                options=[
                    "All eigenvalues are equal to 1",
                    "All eigenvalues are equal to 0",
                    "Values from 1 to $n$",
                    "They depend on matrix dimension"
                ],
                correct_index=0,
                explanation="Since $I_n v = 1 \\cdot v$ for every vector $v$, 1 is the sole eigenvalue with algebraic multiplicity $n$.",
                topic_tag="Identity Matrix"
            ),
            QuestionItem(
                id="math-easy-6",
                question="If $\\lambda = 0$ is an eigenvalue of matrix $A$, what can be conclusively deduced?",
                options=[
                    "Matrix $A$ is singular and non-invertible ($\\det(A) = 0$)",
                    "Matrix $A$ must be symmetric",
                    "All other eigenvalues are also zero",
                    "Matrix $A$ is the zero matrix"
                ],
                correct_index=0,
                explanation="Because $\\det(A) = \\prod \\lambda_i$, any zero eigenvalue guarantees $\\det(A) = 0$, rendering $A$ non-invertible.",
                topic_tag="Singularity"
            ),
            QuestionItem(
                id="math-easy-7",
                question="If matrix $A$ has eigenvalue $\\lambda$, what is the corresponding eigenvalue of scalar multiple $k A$ (where $k \\neq 0$)?",
                options=[
                    "$k \\lambda$",
                    "$\\lambda / k$",
                    "$\\lambda + k$",
                    "$\\lambda^k$"
                ],
                correct_index=0,
                explanation="Multiplying $(Av = \\lambda v)$ by scalar $k$ yields $(kA)v = k(\\lambda v) = (k\\lambda)v$.",
                topic_tag="Scalar Multiplication"
            )
        ],
        "medium": [
            QuestionItem(
                id="math-med-1",
                question="A $2 \\times 2$ matrix $A$ has $\\text{Trace}(A) = 7$ and $\\det(A) = 10$. What are its eigenvalues?",
                options=[
                    "$\\lambda_1 = 2, \\lambda_2 = 5$",
                    "$\\lambda_1 = 3, \\lambda_2 = 4$",
                    "$\\lambda_1 = 1, \\lambda_2 = 10$",
                    "$\\lambda_1 = -2, \\lambda_2 = -5$"
                ],
                correct_index=0,
                explanation="Characteristic equation: $\\lambda^2 - \\text{Trace}(A)\\lambda + \\det(A) = \\lambda^2 - 7\\lambda + 10 = (\\lambda - 2)(\\lambda - 5) = 0$. Hence $\\lambda = 2, 5$.",
                topic_tag="Eigenvalue Calculation"
            ),
            QuestionItem(
                id="math-med-2",
                question="According to the Cayley-Hamilton theorem, every square matrix satisfies:",
                options=[
                    "Its own characteristic polynomial equation $p(A) = 0$",
                    "$A^2 = A$",
                    "$A^T A = I$",
                    "$\\det(A) A = I$"
                ],
                correct_index=0,
                explanation="The Cayley-Hamilton theorem states that substituting matrix $A$ into its characteristic polynomial $\\det(A - \\lambda I) = 0$ yields the zero matrix $p(A) = 0$.",
                topic_tag="Cayley-Hamilton Theorem"
            ),
            QuestionItem(
                id="math-med-3",
                question="If invertible matrix $A$ has eigenvalue $\\lambda \\neq 0$, what is the eigenvalue of its inverse $A^{-1}$?",
                options=[
                    "$\\frac{1}{\\lambda}$",
                    "$-\\lambda$",
                    "$\\lambda$",
                    "$\\lambda^2$"
                ],
                correct_index=0,
                explanation="From $Av = \\lambda v$, multiply by $A^{-1}$ on both sides: $v = \\lambda A^{-1}v \\implies A^{-1}v = \\frac{1}{\\lambda}v$.",
                topic_tag="Inverse Matrix Eigenvalues"
            ),
            QuestionItem(
                id="math-med-4",
                question="What are the eigenvalues of an upper triangular matrix?",
                options=[
                    "The elements on its main diagonal",
                    "The sum of all elements in each row",
                    "Roots of its determinant only",
                    "All equal to the trace divided by dimension"
                ],
                correct_index=0,
                explanation="Because $(A - \\lambda I)$ is also upper triangular, its determinant is simply the product of $(a_{ii} - \\lambda)$, so eigenvalues are the diagonal entries $a_{ii}$.",
                topic_tag="Triangular Matrices"
            ),
            QuestionItem(
                id="math-med-5",
                question="If $v$ is an eigenvector of $A$ with eigenvalue $\\lambda$, what is $A^3 v$?",
                options=[
                    "$\\lambda^3 v$",
                    "$3 \\lambda v$",
                    "$\\lambda v^3$",
                    "$A v$"
                ],
                correct_index=0,
                explanation="Applying matrix $A$ repeatedly: $A(Av) = A(\\lambda v) = \\lambda^2 v$, and $A(A^2 v) = \\lambda^3 v$.",
                topic_tag="Matrix Powers"
            ),
            QuestionItem(
                id="math-med-6",
                question="How do the eigenvalues of matrix transpose $A^T$ compare with the eigenvalues of $A$?",
                options=[
                    "They are identical because $\\det(A^T - \\lambda I) = \\det(A - \\lambda I)$",
                    "They are reciprocals of each other",
                    "They have opposite signs",
                    "They are squared"
                ],
                correct_index=0,
                explanation="Since the determinant of a matrix equals the determinant of its transpose, $\\det((A - \\lambda I)^T) = \\det(A - \\lambda I) = 0$, so roots are identical.",
                topic_tag="Transpose Eigenvalues"
            )
        ],
        "hard": [
            QuestionItem(
                id="math-hard-1",
                question="Matrix $A$ has eigenvalues $2$ and $3$. What are the eigenvalues of polynomial matrix $B = A^2 - 3A + 2I$?",
                options=[
                    "$0$ and $2$",
                    "$1$ and $4$",
                    "$2$ and $6$",
                    "$-1$ and $3$"
                ],
                correct_index=0,
                explanation="By spectral mapping theorem: for $\\lambda = 2$: $2^2 - 3(2) + 2 = 4 - 6 + 2 = 0$. For $\\lambda = 3$: $3^2 - 3(3) + 2 = 9 - 9 + 2 = 2$. Eigenvalues of $B$ are $0$ and $2$.",
                topic_tag="Spectral Mapping Theorem"
            ),
            QuestionItem(
                id="math-hard-2",
                question="For any real orthogonal matrix $Q$ ($Q^T Q = I$), what can be proven regarding the magnitude $|\\lambda|$ of any complex eigenvalue $\\lambda$?",
                options=[
                    "$|\\lambda| = 1$",
                    "$|\\lambda| = 0$",
                    "$|\\lambda| \\ge 1$",
                    "$|\\lambda| \\le \\frac{1}{2}$"
                ],
                correct_index=0,
                explanation="Orthogonal transformations preserve vector Euclidean norms: $\\|Qv\\| = \\|v\\|$. Since $Qv = \\lambda v$, $\\|Qv\\| = |\\lambda| \\|v\\| = \\|v\\|$, proving $|\\lambda| = 1$.",
                topic_tag="Orthogonal Matrices"
            ),
            QuestionItem(
                id="math-hard-3",
                question="A $3 \\times 3$ matrix $A$ has $\\text{Trace}(A) = 6$, $\\det(A) = 6$, and one known eigenvalue $\\lambda_1 = 1$. What are the remaining eigenvalues?",
                options=[
                    "$\\lambda_2 = 2, \\lambda_3 = 3$",
                    "$\\lambda_2 = 1, \\lambda_3 = 4$",
                    "$\\lambda_2 = -1, \\lambda_3 = 6$",
                    "$\\lambda_2 = 2.5, \\lambda_3 = 2.5$"
                ],
                correct_index=0,
                explanation="Trace: $1 + \\lambda_2 + \\lambda_3 = 6 \\implies \\lambda_2 + \\lambda_3 = 5$. Determinant: $1 \\cdot \\lambda_2 \\cdot \\lambda_3 = 6 \\implies \\lambda_2 \\lambda_3 = 6$. The roots of $\\mu^2 - 5\\mu + 6 = 0$ are $\\mu = 2, 3$.",
                topic_tag="Multi-Eigenvalue System"
            ),
            QuestionItem(
                id="math-hard-4",
                question="Under what condition is a square matrix $A$ classified as 'defective' and incapable of being diagonalized?",
                options=[
                    "When the geometric multiplicity of an eigenvalue is strictly less than its algebraic multiplicity",
                    "When $\\det(A) = 0$",
                    "When all eigenvalues are real and distinct",
                    "When the matrix is non-symmetric"
                ],
                correct_index=0,
                explanation="A matrix is diagonalizable if and only if it has $n$ linearly independent eigenvectors. When geometric multiplicity < algebraic multiplicity, an eigenvector defect occurs.",
                topic_tag="Matrix Defectiveness"
            ),
            QuestionItem(
                id="math-hard-5",
                question="For a real symmetric matrix $A$, what are the sharp lower and upper bounds of the Rayleigh quotient $R(x) = \\frac{x^T A x}{x^T x}$ for all $x \\neq 0$?",
                options=[
                    "$\\lambda_{\\min} \\le R(x) \\le \\lambda_{\\max}$",
                    "$0 \\le R(x) \\le \\det(A)$",
                    "$-1 \\le R(x) \\le 1$",
                    "$\\text{Trace}(A) \\le R(x) \\le \\|A\\|_F$"
                ],
                correct_index=0,
                explanation="By Rayleigh-Ritz theorem, expanding $x$ in the orthonormal eigenbasis of symmetric matrix $A$ proves that $R(x)$ is strictly bounded between the minimum and maximum eigenvalues.",
                topic_tag="Rayleigh Quotient"
            ),
            QuestionItem(
                id="math-hard-6",
                question="What is the relation between the spectral radius $\\rho(A) = \\max_i |\\lambda_i|$ and any induced matrix norm $\\|A\\|$?",
                options=[
                    "$\\rho(A) \\le \\|A\\|$ for all induced norms",
                    "$\\rho(A) = \\|A\\|$ for all non-symmetric matrices",
                    "$\\rho(A) \\ge \\|A\\|$ always",
                    "$\\rho(A) = \\sqrt{\\|A\\|}$"
                ],
                correct_index=0,
                explanation="For any induced norm and eigenvector $x$: $\\|Ax\\| = |\\lambda| \\|x\\| \\le \\|A\\| \\|x\\| \\implies |\\lambda| \\le \\|A\\|$. Hence $\\rho(A) \\le \\|A\\|$.",
                topic_tag="Spectral Radius Bound"
            )
        ]
    },

    # -------------------------------------------------------------
    # 2. Machine Learning: CNN Feature Extraction & Pooling
    # -------------------------------------------------------------
    "convolutional_neural_networks": {
        "easy": [
            QuestionItem(
                id="cnn-easy-1",
                question="What is the primary function of a convolutional kernel (filter) in a CNN layer?",
                options=[
                    "To extract local spatial features such as edges, textures, and patterns through matrix convolution",
                    "To flatten multidimensional feature maps into a 1D vector",
                    "To randomly drop connections to prevent overfitting",
                    "To convert pixel values to binary classifications"
                ],
                correct_index=0,
                explanation="Convolution filters slide across input channels computing dot products to extract spatially localized feature maps.",
                topic_tag="Kernel Function"
            ),
            QuestionItem(
                id="cnn-easy-2",
                question="Which activation function is most widely used after convolutional layers to introduce non-linearity?",
                options=[
                    "ReLU (Rectified Linear Unit, $f(x) = \\max(0, x)$)",
                    "Linear Identity ($f(x) = x$)",
                    "Step function",
                    "Softmax"
                ],
                correct_index=0,
                explanation="ReLU mitigates the vanishing gradient problem in deep networks and allows efficient gradient flow through positive activations.",
                topic_tag="Activation Functions"
            ),
            QuestionItem(
                id="cnn-easy-3",
                question="What is the primary operational effect of a Max Pooling layer in a CNN?",
                options=[
                    "It downsamples spatial dimensions by retaining only the maximum activation in each window",
                    "It doubles the number of feature channels",
                    "It computes the average pixel intensity of the image",
                    "It adds trainable weights to the feature maps"
                ],
                correct_index=0,
                explanation="Max Pooling reduces height and width while preserving dominant features, reducing computation and providing translation invariance.",
                topic_tag="Max Pooling"
            ),
            QuestionItem(
                id="cnn-easy-4",
                question="In CNN terminology, what does 'Stride' refer to?",
                options=[
                    "The number of pixels by which the filter shifts across the input matrix during convolution",
                    "The number of zeros added to the input boundary",
                    "The total number of channels in the input image",
                    "The learning rate decay factor"
                ],
                correct_index=0,
                explanation="Stride $S$ is the step size (in pixels) that the kernel slides across rows and columns of the input.",
                topic_tag="Stride Definition"
            ),
            QuestionItem(
                id="cnn-easy-5",
                question="Why is zero-padding commonly applied to input feature maps before convolution?",
                options=[
                    "To preserve spatial resolution and prevent feature maps from shrinking prematurely at borders",
                    "To accelerate GPU memory bandwidth",
                    "To eliminate negative weights",
                    "To convert grayscale images to RGB"
                ],
                correct_index=0,
                explanation="Padding borders with zeros allows kernels to process boundary pixels evenly and keeps output spatial dimensions controlled ('same padding').",
                topic_tag="Padding"
            )
        ],
        "medium": [
            QuestionItem(
                id="cnn-med-1",
                question="An input feature map of size $32 \\times 32$ is convolved with a $5 \\times 5$ filter, stride $S = 1$, and zero padding $P = 0$. What is the output dimension?",
                options=[
                    "$28 \\times 28$",
                    "$30 \\times 30$",
                    "$32 \\times 32$",
                    "$27 \\times 27$"
                ],
                correct_index=0,
                explanation="Formula: $O = \\lfloor (W - F + 2P)/S \\rfloor + 1 = (32 - 5 + 0)/1 + 1 = 27 + 1 = 28$. Hence the output is $28 \\times 28$.",
                topic_tag="Output Dimension Calculation"
            ),
            QuestionItem(
                id="cnn-med-2",
                question="How does Max Pooling compare with Average Pooling in terms of feature retention?",
                options=[
                    "Max Pooling preserves sharp high-frequency details (like edges), while Average Pooling smooths features",
                    "Max Pooling has more trainable parameters than Average Pooling",
                    "Average Pooling always produces larger output maps",
                    "Max Pooling cannot be used with ReLU activations"
                ],
                correct_index=0,
                explanation="Max Pooling captures dominant activations (edges and bright markers), whereas Average Pooling computes local background smoothing.",
                topic_tag="Pooling Comparison"
            ),
            QuestionItem(
                id="cnn-med-3",
                question="What key architectural advantage does weight sharing provide in convolutional layers compared to fully connected layers?",
                options=[
                    "It drastically reduces the number of trainable parameters and enforces translation equivariance",
                    "It guarantees 100% training accuracy without backpropagation",
                    "It eliminates the need for activation functions",
                    "It prevents the network from processing color images"
                ],
                correct_index=0,
                explanation="Using the same kernel across the entire image means weights are shared, reducing parameters from millions to thousands and enabling shift equivariance.",
                topic_tag="Weight Sharing"
            ),
            QuestionItem(
                id="cnn-med-4",
                question="Two consecutive $3 \\times 3$ convolutional layers (stride 1) have an effective receptive field on the input equivalent to:",
                options=[
                    "One $5 \\times 5$ convolutional filter",
                    "One $6 \\times 6$ convolutional filter",
                    "One $9 \\times 9$ convolutional filter",
                    "One $3 \\times 3$ filter"
                ],
                correct_index=0,
                explanation="Stacking two $3 \\times 3$ layers gives receptive field $1 + (3 - 1) + (3 - 1) = 5$, covering a $5 \\times 5$ area with fewer parameters ($2 \\times 3^2 = 18$ vs $5^2 = 25$).",
                topic_tag="Receptive Field"
            ),
            QuestionItem(
                id="cnn-med-5",
                question="Why does ReLU solve the vanishing gradient issue more effectively than the Sigmoid function in deep CNNs?",
                options=[
                    "The derivative of ReLU for positive inputs is constant ($1$), avoiding exponential gradient decay during backpropagation",
                    "ReLU normalizes gradients to zero mean and unit variance",
                    "ReLU computes square roots instead of exponentials",
                    "ReLU requires double precision floating point calculations"
                ],
                correct_index=0,
                explanation="Sigmoid derivatives saturate near 0 for large inputs (maximum derivative is only 0.25), whereas ReLU has derivative 1 for all $x > 0$.",
                topic_tag="Vanishing Gradient"
            )
        ],
        "hard": [
            QuestionItem(
                id="cnn-hard-1",
                question="A convolutional layer takes an input of shape $C_{in} = 64$ channels and produces $C_{out} = 128$ feature maps using $3 \\times 3$ filters with bias. What is the total number of trainable parameters in this layer?",
                options=[
                    "$73,856$",
                    "$24,576$",
                    "$147,584$",
                    "$8,192$"
                ],
                correct_index=0,
                explanation="Weights: $C_{out} \\times (C_{in} \\times F \\times F) = 128 \\times (64 \\times 3 \\times 3) = 128 \\times 576 = 73,728$. Biases: $128$. Total: $73,728 + 128 = 73,856$.",
                topic_tag="Parameter Calculation"
            ),
            QuestionItem(
                id="cnn-hard-2",
                question="What is the primary role of a $1 \\times 1$ convolution (pointwise convolution) in deep architectures like Inception and ResNet?",
                options=[
                    "Dimensionality reduction and channel-wise projection across depth without altering spatial dimensions",
                    "Spatial blur and image de-noising",
                    "Direct replacement for batch normalization",
                    "Zero-padding expansion for edge detection"
                ],
                correct_index=0,
                explanation="A $1 \\times 1$ conv acts as a cross-channel linear combination, reducing or expanding channel depth with minimal compute while adding non-linearity.",
                topic_tag="1x1 Convolutions"
            ),
            QuestionItem(
                id="cnn-hard-3",
                question="For a dilated (atrous) convolution with kernel size $k = 3$ and dilation rate $r = 2$, what is the effective kernel size $k_{eff}$?",
                options=[
                    "$5$",
                    "$6$",
                    "$7$",
                    "$4$"
                ],
                correct_index=0,
                explanation="Formula: $k_{eff} = k + (k - 1)(r - 1) = 3 + (2)(1) = 5$. Dilated convolution expands the receptive field without adding extra parameters.",
                topic_tag="Dilated Convolutions"
            ),
            QuestionItem(
                id="cnn-hard-4",
                question="During backpropagation through a Max Pooling layer, how are incoming gradients routed to the preceding layer?",
                options=[
                    "The gradient is routed exclusively to the neuron that had the maximum activation during the forward pass; all other neurons receive 0",
                    "The gradient is divided equally among all positions in the pooling window",
                    "The gradient is multiplied by the average value of the window",
                    "The gradient is discarded because pooling has no trainable parameters"
                ],
                correct_index=0,
                explanation="Max pooling functions as a routing switch: during forward pass, it records an argmax mask, and backward gradients flow solely through the winning unit.",
                topic_tag="Backpropagation in Pooling"
            ),
            QuestionItem(
                id="cnn-hard-5",
                question="What causes the 'Dying ReLU' problem in deep CNNs, and what structural mechanism mitigates it?",
                options=[
                    "Persistent large negative gradients push weights so that $x < 0$ always, outputting 0; mitigated by Leaky ReLU or Parametric ReLU",
                    "Gradients grow infinitely large; mitigated by dropout",
                    "Filters become symmetric; mitigated by Xavier initialization",
                    "Memory exhaustion during mini-batching; mitigated by weight decay"
                ],
                correct_index=0,
                explanation="If a neuron gets updated such that it never activates positively, its gradient is permanently 0. Leaky ReLU ($f(x) = \\max(\\alpha x, x)$ with $\\alpha > 0$) prevents this.",
                topic_tag="Dying ReLU & Mitigations"
            )
        ]
    },

    # -------------------------------------------------------------
    # 3. Computer Science: C Programming, Type Casting & Precedence
    # -------------------------------------------------------------
    "c_programming": {
        "easy": [
            QuestionItem(
                id="c-easy-1",
                question="In C programming, what is the syntax for explicit type casting of variable $x$ to float?",
                options=[
                    "$(float)x$",
                    "$float(x)$",
                    "$x.toFloat()$",
                    "$\\text{cast}<float>(x)$"
                ],
                correct_index=0,
                explanation="In C, explicit casting uses the syntax `(type_name) expression`, e.g., `(float)x`.",
                topic_tag="Type Cast Syntax"
            ),
            QuestionItem(
                id="c-easy-2",
                question="In the standard C operator precedence hierarchy, which operator has the highest precedence?",
                options=[
                    "Parentheses `()`",
                    "Multiplication `*`",
                    "Addition `+`",
                    "Assignment `=`"
                ],
                correct_index=0,
                explanation="Parentheses `()` have the highest precedence (precedence level 1), overriding default evaluation orders.",
                topic_tag="Operator Precedence"
            ),
            QuestionItem(
                id="c-easy-3",
                question="In C, what is the result of the integer division expression `5 / 2`?",
                options=[
                    "`2` (fractional portion truncated)",
                    "`2.5`",
                    "`3`",
                    "Compilation error"
                ],
                correct_index=0,
                explanation="Integer division in C truncates any decimal remainder toward zero, evaluating `5 / 2` to `2`.",
                topic_tag="Integer Truncation"
            ),
            QuestionItem(
                id="c-easy-4",
                question="What is the guaranteed minimum size of `char` in C according to standard specifications?",
                options=[
                    "1 byte (at least 8 bits)",
                    "2 bytes",
                    "4 bytes",
                    "Depends on CPU register width"
                ],
                correct_index=0,
                explanation="The C standard specifies `sizeof(char)` is always exactly 1 by definition.",
                topic_tag="Data Types"
            ),
            QuestionItem(
                id="c-easy-5",
                question="What is implicit type conversion (promotion) in C?",
                options=[
                    "Automatic promotion of smaller data types to wider data types in mixed-mode expressions",
                    "Manual conversion specified by the programmer",
                    "Converting pointers to integers",
                    "Converting source code to machine assembly"
                ],
                correct_index=0,
                explanation="Implicit conversion is automatic promotion performed by the compiler (e.g. `char` -> `int` -> `double`) to prevent precision loss.",
                topic_tag="Type Promotion"
            )
        ],
        "medium": [
            QuestionItem(
                id="c-med-1",
                question="Given integers `int total = 15; int count = 2;`, what is the evaluated value of `float avg = (float)total / count;`?",
                options=[
                    "`7.5`",
                    "`7.0`",
                    "`7`",
                    "`8.0`"
                ],
                correct_index=0,
                explanation="Explicitly casting `total` to `float` makes the numerator `15.0f`. Mixed division promotes `count` to `float`, giving `15.0f / 2.0f = 7.5f`.",
                topic_tag="Expression Evaluation"
            ),
            QuestionItem(
                id="c-med-2",
                question="What is the value of `x` after evaluating: `int a = 5, b = 2, c = 3; int x = a + b * c;`?",
                options=[
                    "`11`",
                    "`21`",
                    "`13`",
                    "`10`"
                ],
                correct_index=0,
                explanation="Multiplication `*` has higher precedence than addition `+`, so `b * c` evaluates first ($2 \\times 3 = 6$), followed by $5 + 6 = 11$.",
                topic_tag="Precedence Hierarchy"
            ),
            QuestionItem(
                id="c-med-3",
                question="In C, what is the difference between `++i` (pre-increment) and `i++` (post-increment) inside an assignment `x = ++i;` vs `x = i++;`?",
                options=[
                    "`++i` increments first and yields the new value; `i++` yields the current value and increments after",
                    "`i++` is invalid syntax in ANSI C",
                    "They behave identically in all expressions",
                    "`++i` can only be used with floating point variables"
                ],
                correct_index=0,
                explanation="Pre-increment `++i` increments before returning value, whereas post-increment `i++` returns the existing value before updating.",
                topic_tag="Increment Operators"
            ),
            QuestionItem(
                id="c-med-4",
                question="If `ptr` is an `int*` pointing to address `0x1000` on a system where `sizeof(int) == 4`, what address does `ptr + 2` evaluate to?",
                options=[
                    "`0x1008`",
                    "`0x1002`",
                    "`0x1004`",
                    "`0x1010`"
                ],
                correct_index=0,
                explanation="Pointer arithmetic scales by `sizeof(*ptr)`: `0x1000 + 2 * 4 bytes = 0x1000 + 8 = 0x1008`.",
                topic_tag="Pointer Arithmetic"
            ),
            QuestionItem(
                id="c-med-5",
                question="What does the expression `!0` evaluate to in standard C?",
                options=[
                    "`1` (integer representation of true)",
                    "`0`",
                    "`-1`",
                    "`NULL`"
                ],
                correct_index=0,
                explanation="Logical NOT `!` on zero (false) yields `1` (true) of type `int`.",
                topic_tag="Logical Operators"
            )
        ],
        "hard": [
            QuestionItem(
                id="c-hard-1",
                question="What is the result of executing `int i = 1; i = i++ + ++i;` in C according to standard ISO C?",
                options=[
                    "Undefined behavior because the variable `i` is modified more than once between sequence points",
                    "Guaranteed to be 4 on all compilers",
                    "Guaranteed to be 5",
                    "A mandatory compilation error"
                ],
                correct_index=0,
                explanation="Modifying a scalar object multiple times between consecutive sequence points invokes undefined behavior (C99 §6.5/2).",
                topic_tag="Sequence Points & Undefined Behavior"
            ),
            QuestionItem(
                id="c-hard-2",
                question="What is the value of expression `1 < 2 < 3` versus `3 > 2 > 1` in C?",
                options=[
                    "`1 < 2 < 3` is `1` (true); `3 > 2 > 1` is `0` (false)",
                    "Both evaluate to `1` (true)",
                    "Both evaluate to `0` (false)",
                    "Syntax error"
                ],
                correct_index=0,
                explanation="Relational operators associate left-to-right: `(1 < 2) < 3 \\implies 1 < 3 \\implies 1`. But `(3 > 2) > 1 \\implies 1 > 1 \\implies 0`.",
                topic_tag="Relational Associativity"
            ),
            QuestionItem(
                id="c-hard-3",
                question="What does the 'Strict Aliasing Rule' in C dictate regarding pointer dereferencing?",
                options=[
                    "Two pointers of incompatible types cannot point to the same memory location, allowing the compiler to optimize loads across stores",
                    "Pointers must always point to static memory",
                    "Const pointers cannot be passed to functions",
                    "Only void pointers can be cast"
                ],
                correct_index=0,
                explanation="The strict aliasing rule asserts that pointers of distinct types do not alias the same object (with exceptions like `char*`), allowing aggressive register caching.",
                topic_tag="Strict Aliasing"
            ),
            QuestionItem(
                id="c-hard-4",
                question="In C, what is the evaluated outcome of `unsigned int u = 1; int s = -2; if (s < u) printf(\"A\"); else printf(\"B\");`?",
                options=[
                    "Outputs `B` because signed integer `s` is converted to a large unsigned int via implicit promotion",
                    "Outputs `A` because -2 is mathematically less than 1",
                    "Outputs a compiler warning and halts",
                    "Undefined behavior"
                ],
                correct_index=0,
                explanation="Under standard arithmetic conversions, when signed and unsigned of same rank are compared, the signed operand is converted to unsigned. `-2` becomes `UINT_MAX - 1`, which is $> 1$.",
                topic_tag="Usual Arithmetic Conversions"
            ),
            QuestionItem(
                id="c-hard-5",
                question="What does the declaration `int (*(*fp)(int))[5];` represent in C?",
                options=[
                    "`fp` is a pointer to a function taking `int` and returning a pointer to an array of 5 integers",
                    "`fp` is an array of 5 function pointers taking int",
                    "`fp` is a function taking array of 5 ints and returning int",
                    "`fp` is a syntax error"
                ],
                correct_index=0,
                explanation="Following spiral/clockwise rule: `fp` is pointer to function `(int)` returning pointer `*` to array of 5 integers `[5]` of type `int`.",
                topic_tag="Complex Declarations"
            )
        ]
    }
}

def match_topic_key(topic: str, subject: str = "") -> str:
    """Matches user topic and subject keywords to the nearest question bank domain."""
    blob = f"{topic} {subject}".lower()
    if any(k in blob for k in ["eigen", "matrix", "matrices", "linear algebra", "determinant", "characteristic"]):
        return "linear_algebra"
    if any(k in blob for k in ["cnn", "convolution", "pooling", "deep learning", "neural network", "feature extraction"]):
        return "convolutional_neural_networks"
    if any(k in blob for k in ["c program", "type cast", "precedence", "operator", "pointer", "syntax"]):
        return "c_programming"
    return "linear_algebra" # Default academic engineering domain

def get_questions_from_bank(
    topic: str,
    subject: str,
    difficulty: str,
    num_questions: int,
    excluded_fingerprints: Set[str],
    excluded_stems: List[str]
) -> Tuple[List[QuestionItem], bool, Optional[str]]:
    """
    Retrieves filtered, unattempted questions from the curated bank.
    Guarantees no duplicate questions and strictly respects difficulty.
    Returns: (selected_questions, is_demo, notice_message)
    """
    domain = match_topic_key(topic, subject)
    difficulty_clean = difficulty.lower() if difficulty.lower() in ["easy", "medium", "hard"] else "medium"
    
    domain_bank = QUESTION_BANK.get(domain, QUESTION_BANK["linear_algebra"])
    candidate_pool = domain_bank.get(difficulty_clean, domain_bank["medium"])
    
    # 1. Filter out previously attempted questions for this student
    available: List[QuestionItem] = []
    for q in candidate_pool:
        fp = compute_question_fingerprint(q.question)
        if fp in excluded_fingerprints:
            continue
            
        is_dup = False
        for prev in excluded_stems:
            if are_questions_duplicate(q.question, prev):
                is_dup = True
                break
                
        if not is_dup:
            available.append(q)
            
    # 2. Check if we have enough fresh questions
    notice: Optional[str] = None
    if len(available) >= num_questions:
        selected = available[:num_questions]
    else:
        # All available questions in this offline bank were exhausted by the student
        selected = list(available)
        remaining_needed = num_questions - len(selected)
        
        # Pull from general bank while informing student
        reused = [q for q in candidate_pool if q not in selected][:remaining_needed]
        selected.extend(reused)
        notice = f"Notice: You have completed all {len(candidate_pool)} offline practice questions for {difficulty_clean.capitalize()} level on this topic. Resetting question pool for continuous practice."
        
    return selected, True, notice

