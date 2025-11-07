from fastfeatures import get_sql_models
import sys

# Get a reference to the 'features' package module itself.
features_package = sys.modules[__name__]

# Pass the module object to the discovery function
__all__ = get_sql_models(features_package)
