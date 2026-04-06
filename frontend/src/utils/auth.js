const decodeJwtPayload = (token) => {
    if (!token) {
        return null;
    }

    try {
        const [, payloadPart] = token.split('.');
        if (!payloadPart) {
            return null;
        }

        const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = atob(base64);
        return JSON.parse(decoded);
    } catch (error) {
        return null;
    }
};

export const getStoredTokenPayload = () => decodeJwtPayload(localStorage.getItem('token'));

export const getRolesFromPayload = (payload) => {
    if (!payload) {
        return [];
    }

    const roles = [];

    if (typeof payload.role === 'string' && payload.role.trim()) {
        roles.push(payload.role.trim());
    }

    if (Array.isArray(payload.roles)) {
        payload.roles.forEach((role) => {
            if (typeof role === 'string' && role.trim()) {
                roles.push(role.replace(/^ROLE_/, '').trim());
            }
        });
    }

    return [...new Set(roles)];
};

export const hasRole = (payload, role) => getRolesFromPayload(payload).includes(role);

export const getDashboardPathForPayload = (payload) => {
    if (hasRole(payload, 'SUPER_ADMIN')) {
        return '/admin/dashboard';
    }
    if (hasRole(payload, 'COMPANY')) {
        return '/company/dashboard';
    }
    if (hasRole(payload, 'PLACEMENT_OFFICER')) {
        return '/officer/dashboard';
    }
    if (hasRole(payload, 'USER')) {
        return '/user/dashboard';
    }

    return '/jobs';
};
