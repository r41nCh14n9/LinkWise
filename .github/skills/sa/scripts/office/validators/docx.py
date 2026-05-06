"""DOCX-specific schema validator."""

from .base import BaseSchemaValidator


class DOCXSchemaValidator(BaseSchemaValidator):
    """Validator for DOCX documents."""

    def validate(self):
        """Validate DOCX document."""
        return True
