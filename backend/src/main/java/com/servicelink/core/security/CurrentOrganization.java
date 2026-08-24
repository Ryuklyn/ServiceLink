package com.servicelink.core.security;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Resolves a controller Long parameter to the current authenticated user's
 * organization id. See CurrentOrganizationArgumentResolver for the actual
 * (currently stubbed) lookup logic — I don't have your Organization
 * entity/repository, so that resolver throws until it's wired to the real
 * one. Paste OrganizationController.java (visible open in your IDE) and
 * I'll finish it properly.
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME)
public @interface CurrentOrganization {
}