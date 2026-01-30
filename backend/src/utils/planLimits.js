/**
 * Plan Limits Configuration
 */
const PLAN_LIMITS = {
    free: {
        messages: 250,
        products: 10,
        orders: 20,
        agents: 0,
        features: {
            humanHandover: false,
            multiChannel: false,
            flowBuilder: false,
            bulkUpload: false,
            advancedAnalytics: false
        }
    },
    starter: {
        messages: 2000,
        products: 100,
        orders: 200,
        agents: 1,
        features: {
            humanHandover: true,
            multiChannel: false,
            flowBuilder: false,
            bulkUpload: true,
            advancedAnalytics: false
        }
    },
    pro: {
        messages: 10000,
        products: -1, // Unlimited
        orders: -1, // Unlimited
        agents: 5,
        features: {
            humanHandover: true,
            multiChannel: true,
            flowBuilder: true,
            bulkUpload: true,
            advancedAnalytics: true
        }
    },
    business: {
        messages: -1, // Unlimited
        products: -1, // Unlimited
        orders: -1, // Unlimited
        agents: -1, // Unlimited
        features: {
            humanHandover: true,
            multiChannel: true,
            flowBuilder: true,
            bulkUpload: true,
            advancedAnalytics: true,
            whiteLabel: true,
            customIntegrations: true
        }
    }
};

/**
 * Check if workspace can perform action based on plan limits
 */
const checkPlanLimit = (workspace, limitType) => {
    const plan = workspace.plan || 'free';
    const limits = PLAN_LIMITS[plan];

    switch (limitType) {
        case 'product':
            if (limits.products === -1) return { allowed: true };
            return {
                allowed: workspace.usage.productsCount < limits.products,
                current: workspace.usage.productsCount,
                limit: limits.products,
                message: `Free plan จำกัด ${limits.products} สินค้า กรุณาอัปเกรดเป็น Starter Plan`
            };

        case 'order':
            if (limits.orders === -1) return { allowed: true };
            return {
                allowed: workspace.usage.ordersThisMonth < limits.orders,
                current: workspace.usage.ordersThisMonth,
                limit: limits.orders,
                message: `${plan} plan จำกัด ${limits.orders} ออเดอร์/เดือน กรุณาอัปเกรดแพลน`
            };

        case 'message':
            if (limits.messages === -1) return { allowed: true };
            return {
                allowed: workspace.usage.messagesThisMonth < limits.messages,
                current: workspace.usage.messagesThisMonth,
                limit: limits.messages,
                message: `${plan} plan จำกัด ${limits.messages} ข้อความ/เดือน กรุณาอัปเกรดแพลน`
            };

        default:
            return { allowed: true };
    }
};

/**
 * Check if workspace has access to feature
 */
const checkFeatureAccess = (workspace, feature) => {
    const plan = workspace.plan || 'free';
    const limits = PLAN_LIMITS[plan];

    return {
        allowed: limits.features[feature] === true,
        message: `ฟีเจอร์นี้ต้องใช้แพลน Starter ขึ้นไป`
    };
};

/**
 * Update plan limits when plan changes
 */
const updatePlanLimits = (workspace) => {
    const plan = workspace.plan || 'free';
    const limits = PLAN_LIMITS[plan];

    workspace.usage.messagesLimit = limits.messages === -1 ? 999999 : limits.messages;
    workspace.usage.productsLimit = limits.products === -1 ? 999999 : limits.products;
    workspace.usage.ordersLimit = limits.orders === -1 ? 999999 : limits.orders;

    return workspace;
};

module.exports = {
    PLAN_LIMITS,
    checkPlanLimit,
    checkFeatureAccess,
    updatePlanLimits
};
