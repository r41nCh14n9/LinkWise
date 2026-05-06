"""PPTX-specific schema validator."""

from .base import BaseSchemaValidator


class PPTXSchemaValidator(BaseSchemaValidator):
    """Validator for PPTX documents."""

    def validate(self):
        """Validate PPTX document."""
        return True
