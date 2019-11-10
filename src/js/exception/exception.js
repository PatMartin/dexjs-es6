/**
 *
 * Represents a SpecificationException.  This is thrown when the data
 * supplied to a chart does not match it's requirements.
 *
 * @param {Specification} spec - The specification which has been violated.
 * @param {string} assessment - The reason for the violation.
 *
 */
export function SpecificationException(spec, assessment) {
    this.spec = spec;
    this.assessment = assessment;
    this.name = spec.name;
    this.expected = assessment.expected;
    this.received = assessment.received;
}

/**
 *
 * Represents a generic DexException
 *
 * @param {string} message - The exception message.
 *
 */
export function DexException(message) {
    this.message = message;
}
