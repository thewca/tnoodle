/* The version of winstone we use uses
 * sun.reflect.generics.reflectiveObjects.NotImplementedException.  This is not
 * public in openjdk 10.  To work around this, we have a local patch with an
 * exception of the same name.
 */
package winstone.jndi.resourceFactories;

class NotImplementedException extends RuntimeException { }
