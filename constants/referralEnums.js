/**
 * Referral Constants & State Transition Rules
 */
const REFERRAL_PRIORITY = {
  LOW: 'LOW',
  MODERATE: 'MODERATE',
  HIGH: 'HIGH'
};

const REFERRAL_STATUS = {
  CREATED: 'CREATED',
  SENT: 'SENT',
  ACCEPTED: 'ACCEPTED',
  ARRIVED: 'ARRIVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

const ALLOWED_PRIORITIES = Object.values(REFERRAL_PRIORITY);
const ALLOWED_STATUSES = Object.values(REFERRAL_STATUS);

/**
 * Valid Status Transitions State Machine
 * CREATED -> SENT -> ACCEPTED -> ARRIVED -> COMPLETED
 * Cancellation is allowed from CREATED or SENT
 */
const VALID_STATUS_TRANSITIONS = {
  [REFERRAL_STATUS.CREATED]: [REFERRAL_STATUS.SENT, REFERRAL_STATUS.CANCELLED],
  [REFERRAL_STATUS.SENT]: [REFERRAL_STATUS.ACCEPTED, REFERRAL_STATUS.CANCELLED],
  [REFERRAL_STATUS.ACCEPTED]: [REFERRAL_STATUS.ARRIVED],
  [REFERRAL_STATUS.ARRIVED]: [REFERRAL_STATUS.COMPLETED],
  [REFERRAL_STATUS.COMPLETED]: [],
  [REFERRAL_STATUS.CANCELLED]: []
};

/**
 * Helper to validate if a transition is permitted
 * @param {string} currentStatus 
 * @param {string} newStatus 
 * @returns {boolean}
 */
const isValidTransition = (currentStatus, newStatus) => {
  if (currentStatus === newStatus) return true;
  const allowedNext = VALID_STATUS_TRANSITIONS[currentStatus] || [];
  return allowedNext.includes(newStatus);
};

module.exports = {
  REFERRAL_PRIORITY,
  REFERRAL_STATUS,
  ALLOWED_PRIORITIES,
  ALLOWED_STATUSES,
  VALID_STATUS_TRANSITIONS,
  isValidTransition
};
