/**
 * Configuration object for {@link Model} decorator
 */
export interface ModelConfiguration {
    /**
     * Resource type
     */
    type?: string;

    /**
     * Name of the property that store value for discriminator
     */
    discriminator?: string;

    /**
     * Path to resources on server if it doesn't match to resource type
     */
    path?: string;
}