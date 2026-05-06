"""Base validator with common validation logic for document files."""

from pathlib import Path


class BaseSchemaValidator:
    """Base class for schema validators."""

    def __init__(self, unpacked_dir, original_file=None, verbose=False):
        self.unpacked_dir = Path(unpacked_dir).resolve()
        self.original_file = Path(original_file) if original_file else None
        self.verbose = verbose

    def validate(self):
        """Validate document - override in subclasses."""
        return True

    def repair(self) -> int:
        """Repair common issues in the document."""
        return 0
